import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { config } from 'dotenv';
import RugCheckResult from '../model/rug-check-result';
import MetadataCheckConfig from '../model/metadata-check-config';
config();

export default class MetadataChecker {
    private connection: Connection;
    private metaplex: Metaplex;

    constructor({ solanaRpcEndpoint }: MetadataCheckConfig, connection?: Connection, metaplex?: Metaplex) {
        if (!solanaRpcEndpoint) {
            solanaRpcEndpoint = String(process.env.SOLANA_RPC_ENDPOINT);
        }
        if (!connection) {
            connection = new Connection(solanaRpcEndpoint);
        }
        this.connection = connection;
        if (!metaplex) {
            metaplex = Metaplex.make(connection);
        }
        this.metaplex = metaplex;
    }

    async check(tokenAddress: string): Promise<RugCheckResult> {
        const mintAddress = new PublicKey(tokenAddress);
        const metadataAccount = this.metaplex.nfts().pdas().metadata({ mint: mintAddress });
        const metadataAccountInfo = await this.connection.getAccountInfo(metadataAccount);

        return metadataAccountInfo ? this.createRugCheckResult(metadataAccountInfo) : new RugCheckResult();
    }

    private createRugCheckResult(tokenMetadata: any): RugCheckResult {
        const rugCheckResult = new RugCheckResult();

        rugCheckResult.name = tokenMetadata.name;
        rugCheckResult.description = String(tokenMetadata.json?.description);
        rugCheckResult.symbol = tokenMetadata.symbol;
        rugCheckResult.imageUrl = String(tokenMetadata.json?.image);
        rugCheckResult.telegram = String(tokenMetadata.json?.telegram);
        rugCheckResult.website = String(tokenMetadata.json?.website);
        rugCheckResult.twitter = String(tokenMetadata.json?.twitter);
        rugCheckResult.isMutable = tokenMetadata.isMutable;
        rugCheckResult.isMintable = tokenMetadata.mint.mintAuthorityAddress !== null;
        rugCheckResult.isFreezable = tokenMetadata.mint.freezeAuthorityAddress !== null;
        rugCheckResult.isPumpFun = tokenMetadata.json?.createdOn === 'https://pump.fun';

        return rugCheckResult;
    }
}
