import soundfile as sf, json
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
lines = [
 "How do Hub-Funded Spoke Markets work?",
 "Depositors supply once, into the Venus Liquidity Hub.",
 "The Hub allocates capital to Spoke markets, within set risk limits.",
 "Borrowers post collateral, like real-world assets, tokenized stocks, or bluechips, and borrow.",
 "Repayments, with interest, flow back to the Hub as yield for depositors.",
 "One deposit. Every market. Explore Spoke markets on Venus.",
]
out = []
for i, text in enumerate(lines):
    samples, sr = k.create(text, voice="af_heart", speed=1.0, lang="en-us")
    sf.write(f"line{i+1}.wav", samples, sr)
    out.append({"i": i+1, "text": text, "dur": round(len(samples)/sr, 2)})
print(json.dumps(out, indent=1)); print("total", sum(o['dur'] for o in out))
json.dump(out, open("lines.json","w"), indent=1)
