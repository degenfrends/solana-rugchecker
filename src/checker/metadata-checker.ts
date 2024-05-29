import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { config } from 'dotenv';
import MetadataCheckConfig from '../model/config/metadata-check';
import MetadataCheckResult from '../model/result/metadata-check';
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

    async check(tokenAddress: string): Promise<MetadataCheckResult> {
        const mintAddress = new PublicKey(tokenAddress);
        const metadataAccount = this.metaplex.nfts().pdas().metadata({ mint: mintAddress });
        const metadataAccountInfo = await this.connection.getAccountInfo(metadataAccount);
        const tokenMetadata = await this.metaplex.nfts().findByMint({ mintAddress: mintAddress });

        return metadataAccountInfo ? this.createRugCheckResult(tokenMetadata) : new MetadataCheckResult();
    }

    private createRugCheckResult(tokenMetadata: any): MetadataCheckResult {
        const metadataCheckResult = new MetadataCheckResult();
        metadataCheckResult.name = tokenMetadata.name;
        metadataCheckResult.description = String(tokenMetadata.json?.description);
        metadataCheckResult.symbol = tokenMetadata.symbol;
        metadataCheckResult.imageUrl = String(tokenMetadata.json?.image);
        metadataCheckResult.telegram = String(tokenMetadata.json?.telegram);
        metadataCheckResult.website = String(tokenMetadata.json?.website);
        metadataCheckResult.twitter = String(tokenMetadata.json?.twitter);
        metadataCheckResult.isMutable = tokenMetadata.isMutable;
        metadataCheckResult.isMintable = tokenMetadata.mint.mintAuthorityAddress !== null;
        metadataCheckResult.isFreezable = tokenMetadata.mint.freezeAuthorityAddress !== null;
        metadataCheckResult.isPumpFun = tokenMetadata.json?.createdOn === 'https://pump.fun';

        return metadataCheckResult;
    }
}
