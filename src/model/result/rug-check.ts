import HoldersCheckResult from './holders-check';
import LiquidityCheckResult from './liquidity-check';
import MetadataCheckResult from './metadata-check';

export default class RugCheckResult {
    metadata: MetadataCheckResult;
    holders: HoldersCheckResult;
    liquidity: LiquidityCheckResult;
}
