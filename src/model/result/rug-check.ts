import HoldersCheckResult from './holders-check';
import LiquidityCheckResult from './liquidity-check';
import MarketdataCheckResult from './marketdata-check';
import MetadataCheckResult from './metadata-check';

export default class RugCheckResult {
    address: string;
    metadata: MetadataCheckResult;
    holders: HoldersCheckResult;
    liquidity: LiquidityCheckResult;
    marketdata: MarketdataCheckResult;
}
