import type { Token } from 'types';
import iconMapping from './e2TokenIcons.json';

const byIdentity: Record<string, string> = iconMapping.byIdentity;
const bySymbol: Record<string, string> = iconMapping.bySymbol;

// Presentation-only token copy. Call only from E2 lists and planet discovery;
// market forms and shared token records keep their original icons and data.
export function getE2ListToken(token: Token): Token {
  const file =
    byIdentity[`${token.chainId}:${token.address.toLowerCase()}`] ??
    bySymbol[token.symbol.toLowerCase()];

  return file
    ? {
        ...token,
        iconSrc: `${import.meta.env.BASE_URL}images/experiments/e2-thick-glass/${file}`,
      }
    : token;
}
