import asyncio, sys
from playwright.async_api import async_playwright
# usage: frames.py out_dir t1 t2 ...   (or: frames.py out_dir --all fps start end)
out = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':1920,'height':1080})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8765/index.html', timeout=60000)
        await pg.wait_for_function('window.ready !== undefined', timeout=60000)
        await pg.evaluate('window.ready')
        if sys.argv[2] == '--all':
            fps, s, e = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
            for f in range(s, e):
                await pg.evaluate(f'window.renderAt({f/fps})')
                await pg.screenshot(path=f'{out}/f{f:05d}.png')
        else:
            for t in sys.argv[2:]:
                await pg.evaluate(f'window.renderAt({t})')
                await pg.screenshot(path=f'{out}/t{float(t):05.1f}.png')
        if errs: print('ERR', errs[:5])
        await b.close()
asyncio.run(main())
