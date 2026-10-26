import { createContext, useContext } from 'react';
import { chains } from '@venusprotocol/chains';
import { cn } from '@venusprotocol/ui';

import type { Token } from 'types';

// Optional presentation override; token identity and transaction data stay unchanged.
export const TokenIconPresentation = createContext<(token: Token) => Token>(token => token);

export interface TokenIconProps {
  token: Token;
  displayChain?: boolean;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  className,
  token,
  displayChain = false,
  size = 'md',
}) => {
  const chain = chains[token.chainId];
  const presentToken = useContext(TokenIconPresentation);
  const displayToken = presentToken(token);

  return (
    <div
      className={cn(
        'relative flex items-center',
        displayChain && size === 'md' && 'size-8',
        displayChain && size === 'lg' && 'size-13',
        displayChain && size === 'xl' && 'size-16',
        !displayChain && size === 'md' && 'size-5',
        !displayChain && size === 'lg' && 'size-6',
        !displayChain && size === 'xl' && 'size-8',
        className,
      )}
    >
      <img src={displayToken.iconSrc} alt={token.symbol} className="w-full" />

      {displayChain && (
        <img
          src={chain.iconSrc}
          className="size-[37.5%] absolute bottom-0 right-0"
          alt={token.symbol}
        />
      )}
    </div>
  );
};
