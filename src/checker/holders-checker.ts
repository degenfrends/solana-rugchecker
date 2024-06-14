import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import HoldersCheckConfig from '../model/config/holders-check';
import { sleep } from '../utils/helper';
import HoldersCheckResult from '../model/result/holders-check';
import HolderCheckResult from '../model/result/holder-check';

export default class HoldersChecker {
    private connection: Connection;

    constructor({ solanaRpcEndpoint }: HoldersCheckConfig, connection?: Connection) {
        if (!solanaRpcEndpoint) {
            solanaRpcEndpoint = String(process.env.SOLANA_RPC_ENDPOINT);
        }
        if (!connection) {
            connection = new Connection(solanaRpcEndpoint);
        }
        this.connection = connection;
    }

    async check(tokenAddress: string): Promise<HoldersCheckResult> {
        const mintAddress = new PublicKey(tokenAddress);

        const totalSupplyResponse = await this.connection.getTokenSupply(mintAddress);
        const largestHoldersResponse = await this.connection.getTokenLargestAccounts(mintAddress);
        const totalSupply = totalSupplyResponse.value?.uiAmount;
        if (largestHoldersResponse.value.length === 0 || totalSupply === null || totalSupply <= 0) {
            throw new Error('No holders found');
        }
        let whaleSupply = 0;
        let raydiumSupply = 0;
        let topHolders = [];
        for (const holder of largestHoldersResponse.value) {
            const tokenAccountsResponse = await this.connection.getParsedAccountInfo(holder.address);
            const walletAddress = (tokenAccountsResponse.value?.data as ParsedAccountData)?.parsed?.info?.owner;
            if (holder.uiAmount !== null && walletAddress !== null && walletAddress !== '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1') {
                whaleSupply += holder.uiAmount;
                let topHolder = new HolderCheckResult();
                topHolder.address = walletAddress;
                topHolder.amount = holder.uiAmount;
                topHolder.percentage = (holder.uiAmount / totalSupply) * 100;

                topHolders.push(topHolder);
            } else if (holder.uiAmount !== null && walletAddress === '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1') {
                raydiumSupply += holder.uiAmount;
            } else {
                console.error('Holder data not correct', holder);
            }
        }
        const raydiumPercentage = (raydiumSupply / totalSupply) * 100;
        const topHoldersPercentage = (whaleSupply / totalSupply) * 100;
        const holdersCheckResult = new HoldersCheckResult();
        holdersCheckResult.topHolders = topHolders;
        holdersCheckResult.topHoldersPercentage = topHoldersPercentage;
        holdersCheckResult.raydiumPercentage = raydiumPercentage;
        holdersCheckResult.address = tokenAddress;
        return holdersCheckResult;
    }
}
