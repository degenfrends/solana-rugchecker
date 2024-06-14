import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { promises as fs } from 'fs';
import { LIQUIDITY_STATE_LAYOUT_V4 } from '@raydium-io/raydium-sdk';
import LiquidityCheckConfig from '../model/config/liquidity-check';
import LiquidityCheckResult from '../model/result/liquidity-check';
import axios from 'axios';

export default class LiquidityChecker {
    private connection: Connection;

    private poolFilePath: string;
    private poolAddress: string;
    constructor({ solanaRpcEndpoint, poolFilePath, poolAddress }: LiquidityCheckConfig, connection?: Connection) {
        if (!solanaRpcEndpoint) {
            solanaRpcEndpoint = String(process.env.SOLANA_RPC_ENDPOINT);
        }
        if (!poolFilePath) {
            poolFilePath = String(process.env.POOL_FILE_PATH);
        } else {
            this.poolFilePath = poolFilePath;
        }
        if (poolAddress) {
            this.poolAddress = poolAddress;
        }
        if (!connection) {
            connection = new Connection(solanaRpcEndpoint);
        }
        this.connection = connection;
    }

    async check(tokenAddress: string): Promise<LiquidityCheckResult> {
        let poolAddress;
        if (this.poolAddress) {
            poolAddress = this.poolAddress;
        } else {
            if (!this.poolFilePath) {
                poolAddress = await this.getRaydiumPoolAddress(tokenAddress);
            } else {
                poolAddress = await this.getLiquidityPool(tokenAddress);
            }
        }
        const liquidityCheckResult = new LiquidityCheckResult();
        if (!poolAddress) {
            //throw new Error('No pool found');
            liquidityCheckResult.liquidityPoolAddress = '';
            return liquidityCheckResult;
        }
        const acc = await this.connection.getMultipleAccountsInfo([new PublicKey(poolAddress)]);
        const parsed = acc.map((v) => (v ? LIQUIDITY_STATE_LAYOUT_V4.decode(v.data) : null));
        const lpMint = String(parsed[0]?.lpMint);
        let lpReserve = parsed[0]?.lpReserve.toNumber() ?? 0; // Provide a default value of 0 if lpReserve is undefined
        const accInfo = await this.connection.getParsedAccountInfo(new PublicKey(lpMint));
        const mintInfo = (accInfo?.value?.data as ParsedAccountData)?.parsed?.info; // Add type assertion
        lpReserve = lpReserve / Math.pow(10, mintInfo?.decimals);
        const actualSupply = mintInfo?.supply / Math.pow(10, mintInfo?.decimals);
        const maxLpSupply = Math.max(actualSupply, lpReserve - 1);
        const burnAmt = lpReserve - actualSupply;
        const burnPct = (burnAmt / lpReserve) * 100;
        liquidityCheckResult.isLiquidityLocked = burnPct > 95;
        liquidityCheckResult.burnt = burnPct;
        liquidityCheckResult.liquidityPoolAddress = poolAddress;
        liquidityCheckResult.address = tokenAddress;
        return liquidityCheckResult;
    }

    async getLiquidityPool(tokenAddress: string) {
        try {
            const data = await fs.readFile(this.poolFilePath, 'utf8');
            const allPools = JSON.parse(data);

            const pool = allPools.find(
                (pool: { baseMint: string; quoteMint: string }) => pool.baseMint === tokenAddress || pool.quoteMint === tokenAddress
            );

            return pool ? pool.id : '';
        } catch (error) {
            console.error('Error reading or parsing pool file:', error);
            return '';
        }
    }

    async getRaydiumPoolAddress(mintAddress: string) {
        try {
            const url = 'https://api.geckoterminal.com/api/v2/networks/solana/tokens/' + mintAddress;
            const response = await axios.get(url);
            return response.data.data.relationships.top_pools.data[0].id.replace('solana_', '');
        } catch (error) {
            console.error('Error fetching pool address:', error);
        }
    }
}
