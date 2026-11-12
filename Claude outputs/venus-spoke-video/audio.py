import numpy as np, soundfile as sf, json
SR = 24000; DUR = 31.2
starts = [0.5, 3.8, 8.8, 14.3, 21.0, 26.0]
vo = np.zeros(int(SR * DUR), dtype=np.float32)
for i, st in enumerate(starts):
    a, sr = sf.read(f"tts/line{i+1}.wav", dtype='float32'); assert sr == SR
    s = int(st * SR); vo[s:s+len(a)] += a[:len(vo)-s]
vo *= 0.95 / max(1e-6, np.abs(vo).max())
# Placeholder ambient pad: soft A-major chord, slow swell, gentle shimmer.
t = np.arange(len(vo)) / SR
pad = np.zeros_like(t)
for f, g in [(110, .5), (164.81, .35), (220, .3), (277.18, .2), (329.63, .18), (440, .06)]:
    pad += g * np.sin(2*np.pi*f*t + 0.3*np.sin(2*np.pi*0.07*t)) * (0.75 + 0.25*np.sin(2*np.pi*0.11*t + f))
# one-pole low-pass for warmth
out = np.empty_like(pad); y = 0.0; k = 0.08
for i, x in enumerate(pad):
    y += k * (x - y); out[i] = y
env = np.minimum(1, t / 2.5) * np.minimum(1, (DUR - t) / 2.0)
pad = out / np.abs(out).max() * env
# duck the pad under speech
speech = np.convolve(np.abs(vo), np.ones(2400)/2400, mode='same') > 0.01
duck = np.convolve(np.where(speech, 0.55, 1.0), np.ones(4800)/4800, mode='same')
mix = vo + pad * 0.07 * duck
mix *= 0.97 / np.abs(mix).max()
sf.write("voiceover.wav", vo, SR); sf.write("mix.wav", mix, SR)
print("ok", len(mix)/SR)
