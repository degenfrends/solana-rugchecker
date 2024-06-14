import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { config } from 'dotenv';
import { Helius } from 'helius-sdk';
import axios from 'axios';
import MetadataCheckConfig from '../model/config/metadata-check';
import MetadataCheckResult from '../model/result/metadata-check';
const validator = require('validator');

config();

export default class MetadataChecker {
    private connection: Connection;
    private metaplex: Metaplex;
    private heliusApiKey: string;

    constructor({ solanaRpcEndpoint, heliusApiKey }: MetadataCheckConfig, connection?: Connection, metaplex?: Metaplex) {
        if (!solanaRpcEndpoint) {
            solanaRpcEndpoint = String(process.env.SOLANA_RPC_ENDPOINT);
        }
        if (!connection) {
            connection = new Connection(solanaRpcEndpoint);
        }
        this.connection = connection;
        if (!metaplex) {
            metaplex = Metaplex.make(this.connection);
        }
        this.metaplex = metaplex;
        if (heliusApiKey) {
            this.heliusApiKey = heliusApiKey;
        }
    }

    async check(tokenAddress: string): Promise<MetadataCheckResult> {
        const mintAddress = new PublicKey(tokenAddress);
        const tokenMetadata = await this.metaplex.nfts().findByMint({ mintAddress: mintAddress });
        if (tokenMetadata) {
            let metadataCheckResult = this.createRugCheckResult(tokenMetadata);
            if (
                tokenMetadata.json?.createdOn !== 'https://pump.fun' &&
                this.heliusApiKey &&
                (tokenMetadata.json?.twitter != 'undefined' ||
                    tokenMetadata.json?.website != 'undefined' ||
                    tokenMetadata.json?.telegram != 'undefined')
            ) {
                metadataCheckResult = await this.getHeliusMetadata(tokenAddress, metadataCheckResult);
            }
            metadataCheckResult.address = tokenAddress;
            return metadataCheckResult;
        }

        return new MetadataCheckResult();
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
    async getHeliusMetadata(tokenAddress: string, token: MetadataCheckResult) {
        const helius = new Helius(this.heliusApiKey);
        try {
            const response = await helius.rpc.getAsset({
                id: tokenAddress
            });
            const jsonUri = response.content?.json_uri;
            if (jsonUri) {
                const metadataResponse = await axios.get(jsonUri, { timeout: 300000, responseType: 'json' });
                if (metadataResponse.data?.extensions?.website) {
                    const website = metadataResponse.data?.extensions?.website;
                    if (website) {
                        const isValidUrl = validator.isURL(website);
                        if (isValidUrl) {
                            token.website = website;
                        }
                    }
                }
                if (metadataResponse.data?.extensions?.twitter) {
                    const twitter = metadataResponse.data.extensions.twitter;
                    if (twitter) {
                        token.twitter = twitter;
                    }
                }
                if (metadataResponse.data?.extensions?.telegram) {
                    const telegram = metadataResponse.data.extensions.telegram;

                    if (telegram) {
                        token.telegram = telegram;
                    }
                }
            }
        } catch (error) {
            console.error('Metadata could not be fetched: ', error);
        }
        return token;
    }
}
