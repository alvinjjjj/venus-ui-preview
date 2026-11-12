import type { AsciiPlanetSurface } from './AsciiPlanet';

/** Local E2 illustration studies. These do not change the interface tokens. */
export const asciiPlanetStudies: Record<
  string,
  {
    id: string;
    surface: AsciiPlanetSurface;
    name: string;
    description: string;
  }
> = {
  USDT: {
    id: 'A',
    surface: 'diagonal',
    name: '斜光漸層',
    description: '薄荷綠斜落深綠，明暗集中喺一側。',
  },
  sUSDe: {
    id: 'B',
    surface: 'horizon',
    name: '上下雙色',
    description: '上半銀白，下半深藍，層次更分明。',
  },
  BTCB: {
    id: 'C',
    surface: 'rim',
    name: '邊緣金光',
    description: '金光集中喺外緣，中間留暗，較有空間感。',
  },
  USDC: {
    id: 'D',
    surface: 'ribbon',
    name: '冷色光帶',
    description: '一道寬闊冰藍光帶，兩側自然收暗。',
  },
};
