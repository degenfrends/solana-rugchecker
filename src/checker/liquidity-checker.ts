import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { promises as fs } from 'fs';
import { LIQUIDITY_STATE_LAYOUT_V4 } from '@raydium-io/raydium-sdk';
import LiquidityCheckConfig from '../model/config/liquidity-check';
import LiquidityCheckResult from '../model/result/liquidity-check';

export default class LiquidityChecker {
    private connection: Connection;

    private poolFilePath: string;

    constructor({ solanaRpcEndpoint, poolFilePath }: LiquidityCheckConfig, connection?: Connection) {
        if (!solanaRpcEndpoint) {
            solanaRpcEndpoint = String(process.env.SOLANA_RPC_ENDPOINT);
        }
        if (!poolFilePath) {
            poolFilePath = String(process.env.POOL_FILE_PATH);
        }
        this.poolFilePath = poolFilePath;
        if (!connection) {
            connection = new Connection(solanaRpcEndpoint);
        }
        this.connection = connection;
    }

    async check(tokenAddress: string): Promise<LiquidityCheckResult> {
        const poolAddress = await this.getLiquidityPool(tokenAddress);
        if (!poolAddress) {
            throw new Error('No pool found');
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
        const liquidityCheckResult = new LiquidityCheckResult();
        liquidityCheckResult.isLiquidityLocked = burnPct > 95;
        liquidityCheckResult.burnt = burnPct;
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
}
