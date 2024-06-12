import MetadataChecker from './checker/metadata-checker';
import RugCheckResult from './model/result/rug-check';
import RugCheckConfig from './model/config/rug-check';
import HoldersChecker from './checker/holders-checker';
import LiquidityChecker from './checker/liquidity-checker';
import WebsiteChecker from './checker/website-checker';
export default class SPLRugchecker {
    private holdersChecker: HoldersChecker;
    private liquidityChecker: LiquidityChecker;
    private metadataChecker: MetadataChecker;

    public constructor({ solanaRpcEndpoint, poolFilePath }: RugCheckConfig) {
        const metadataCheckConfig = { solanaRpcEndpoint: solanaRpcEndpoint };
        this.metadataChecker = new MetadataChecker(metadataCheckConfig);
        const holdersCheckConfig = { solanaRpcEndpoint: solanaRpcEndpoint };
        this.holdersChecker = new HoldersChecker(holdersCheckConfig);
        const liquidityCheckConfig = { solanaRpcEndpoint: solanaRpcEndpoint, poolFilePath };
        this.liquidityChecker = new LiquidityChecker(liquidityCheckConfig);
    }

    async check(tokenAddress: string): Promise<RugCheckResult> {
        const [metadataCheckResult, holdersCheckResult, liquidityCheckResult] = await Promise.all([
            this.metadataChecker.check(tokenAddress),
            this.holdersChecker.check(tokenAddress),
            this.liquidityChecker.check(tokenAddress)
        ]);

        const rugCheckResult = new RugCheckResult();
        rugCheckResult.metadata = metadataCheckResult;
        rugCheckResult.holders = holdersCheckResult;
        rugCheckResult.liquidity = liquidityCheckResult;

        return rugCheckResult;
    }

    rugScore(rugCheckResult: RugCheckResult): number {
        let rugScore = 0;
        if (rugCheckResult.metadata.isMintable === true) {
            rugScore += 80;
        }
        if (rugCheckResult.metadata.isFreezable === true) {
            rugScore += 65;
        }
        if (rugCheckResult.metadata.isMutable === true) {
            rugScore += 50;
        }
        if (rugCheckResult.holders.topHoldersPercentage >= 50) {
            rugScore += 80;
        } else if (rugCheckResult.holders.topHoldersPercentage >= 35) {
            rugScore += 60;
        } else if (rugCheckResult.holders.topHoldersPercentage >= 20) {
            rugScore += 50;
        }
        if (rugCheckResult.liquidity.isLiquidityLocked === false) {
            rugScore += 80;
        }
        for (const holder of rugCheckResult.holders.topHolders) {
            if (holder.percentage >= 10) {
                rugScore += 80;
            } else if (holder.percentage >= 7) {
                rugScore += 70;
            } else if (holder.percentage >= 5) {
                rugScore += 50;
            } else if (holder.percentage >= 3) {
                rugScore += 40;
            } else if (holder.percentage >= 2) {
                rugScore += 30;
            } else if (holder.percentage >= 1) {
                rugScore += 20;
            }
        }
        return rugScore;
    }

    isRug(rugCheckResult: RugCheckResult): boolean {
        const rugScore = this.rugScore(rugCheckResult);
        if (rugScore >= 80) {
            return true;
        }

        return false;
    }
}
export { WebsiteChecker };
