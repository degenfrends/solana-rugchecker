import HolderCheckResult from './holder-check';

export default class HoldersCheckResult {
    address: string;
    topHolders: HolderCheckResult[];
    topHoldersPercentage: number;
    raydiumPercentage: number;
}
