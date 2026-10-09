/**
 * Short excerpts in the shape of Venus's open-source contracts, shown in the
 * bounty card's code windows. `flag` is the line the scan stops on.
 */
export const contracts = [
  {
    file: 'Comptroller.sol',
    flag: 7,
    lines: [
      'function borrowAllowed(',
      '    address vToken, address borrower, uint borrowAmount',
      ') external returns (uint) {',
      '    checkProtocolPauseState();',
      '    checkActionPauseState(vToken, Action.BORROW);',
      '    ensureListed(markets[vToken]);',
      '    uint borrowCap = borrowCaps[vToken];',
      '    uint nextTotal = add_(totalBorrows(vToken), borrowAmount);',
      '    require(nextTotal <= borrowCap, "cap reached");',
      '    (, , uint shortfall) = getHypotheticalLiquidity(borrower);',
      '    if (shortfall > 0) return uint(Error.INSUFFICIENT_LIQUIDITY);',
      '    return uint(Error.NO_ERROR);',
      '}',
    ],
  },
  {
    file: 'VToken.sol',
    flag: 6,
    lines: [
      'function mintFresh(address minter, uint mintAmount)',
      '    internal returns (uint, uint)',
      '{',
      '    uint allowed = comptroller.mintAllowed(address(this), minter);',
      '    if (allowed != 0) return (failOpaque(allowed), 0);',
      '    Exp memory exchangeRate = Exp({ mantissa: exchangeRateStored() });',
      '    uint actualMint = doTransferIn(minter, mintAmount);',
      '    uint mintTokens = div_(actualMint, exchangeRate);',
      '    totalSupply = add_(totalSupply, mintTokens);',
      '    accountTokens[minter] = add_(accountTokens[minter], mintTokens);',
      '    emit Mint(minter, actualMint, mintTokens);',
      '    return (uint(Error.NO_ERROR), actualMint);',
      '}',
    ],
  },
  {
    file: 'ResilientOracle.sol',
    flag: 5,
    lines: [
      'function getUnderlyingPrice(address vToken)',
      '    external view returns (uint256)',
      '{',
      '    address asset = _getUnderlyingAsset(vToken);',
      '    uint256 price = _getPrice(asset);',
      '    (bool ok, uint256 pivot) = _pivotPrice(asset, price);',
      '    if (!ok) price = _fallbackPrice(asset, price);',
      '    if (price == INVALID_PRICE) revert("invalid price");',
      '    return price;',
      '}',
      '',
      'function _getPrice(address asset) internal view returns (uint256) {',
      '    return _mainOracle(asset).getPrice(asset);',
    ],
  },
] as const;
