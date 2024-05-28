import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import MetadataChecker from '../../src/checker/metadata-checker';
import RugCheckResult from '../../src/model/rug-check-result';

//jest.mock('@solana/web3.js');
//jest.mock('@metaplex-foundation/js');

describe('MetadataChecker', () => {
    let connection: Connection;
    let metaplex: Metaplex;

    beforeEach(() => {
        connection = new Connection('https://api.devnet.solana.com');
        metaplex = Metaplex.make(connection);
    });

    it('should construct with provided parameters', () => {
        const checker = new MetadataChecker({ solanaRpcEndpoint: 'https://api.devnet.solana.com' }, connection, metaplex);
        expect(checker).toBeDefined();
    });

    it('should construct with default parameters', () => {
        process.env.SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';
        const checker = new MetadataChecker({});
        expect(checker).toBeDefined();
    });

    // it('should return RugCheckResult when metadataAccountInfo is not null', async () => {
    //     const checker = new MetadataChecker({ solanaRpcEndpoint: 'https://api.devnet.solana.com' }, connection, metaplex);
    //     const result = await checker.check('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
    //     expect(result).toBeInstanceOf(RugCheckResult);
    // });

    it('should return new RugCheckResult when metadataAccountInfo is null', async () => {
        const checker = new MetadataChecker({ solanaRpcEndpoint: 'https://api.devnet.solana.com' }, connection, metaplex);
        connection.getAccountInfo = jest.fn().mockResolvedValue(null);
        const result = await checker.check('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
        expect(result).toBeInstanceOf(RugCheckResult);
    });

    it('should create RugCheckResult with correct properties', () => {
        const checker = new MetadataChecker({ solanaRpcEndpoint: 'https://api.devnet.solana.com' }, connection, metaplex);
        const tokenMetadata = {
            name: 'name',
            json: {
                description: 'description',
                image: 'image',
                telegram: 'telegram',
                website: 'website',
                twitter: 'twitter',
                createdOn: 'https://pump.fun'
            },
            symbol: 'symbol',
            isMutable: true,
            mint: {
                mintAuthorityAddress: 'mintAuthorityAddress',
                freezeAuthorityAddress: 'freezeAuthorityAddress'
            }
        };
        const result = (checker as any).createRugCheckResult(tokenMetadata);
        expect(result).toBeInstanceOf(RugCheckResult);
        expect(result.name).toBe('name');
        expect(result.description).toBe('description');
        expect(result.symbol).toBe('symbol');
        expect(result.imageUrl).toBe('image');
        expect(result.telegram).toBe('telegram');
        expect(result.website).toBe('website');
        expect(result.twitter).toBe('twitter');
        expect(result.isMutable).toBe(true);
        expect(result.isMintable).toBe(true);
        expect(result.isFreezable).toBe(true);
        expect(result.isPumpFun).toBe(true);
    });
});
