import MetadataChecker from './checker/metadata-checker';
import RugCheckResult from './model/rug-check-result';
import RugCheckConfig from './model/rug-check-config';

export default class SPLRugchecker {
    private metadataChecker: MetadataChecker;

    constructor({ solanaRpcEndpoint }: RugCheckConfig) {
        const metadataCheckConfig = { solanaRpcEndpoint: solanaRpcEndpoint };
        this.metadataChecker = new MetadataChecker(metadataCheckConfig);
    }

    async check(tokenAddress: string): Promise<RugCheckResult> {
        let rugCheckResult = await this.metadataChecker.check(tokenAddress);

        return rugCheckResult;
    }

    rugScore(rugCheckResult: RugCheckResult): number {
        let rugScore = 0;
        if (rugCheckResult.isMintable === true) {
            rugScore += 20;
        }
        if (rugCheckResult.isFreezable === true) {
            rugScore += 10;
        }
        if (rugCheckResult.isMutable === true) {
            rugScore += 10;
        }
        return rugScore;
    }

    isRug(rugCheckResult: RugCheckResult): boolean {
        let isRug = false;
        if (rugCheckResult.isMintable === true || rugCheckResult.isFreezable === true || rugCheckResult.isMutable === true) {
            isRug = true;
        }
        return isRug;
    }
}
