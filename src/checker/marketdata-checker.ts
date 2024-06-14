import { config } from 'dotenv';
import axios from 'axios';
import MarketdataCheckConfig from '../model/config/marketdata-check';
import MarketdataCheckResult from '../model/result/marketdata-check';

config();

export default class MarketdataChecker {
    constructor({}: MarketdataCheckConfig) {}

    async check(tokenAddress: string): Promise<MarketdataCheckResult> {
        const marketdataResponse = await axios.get('https://api.dexscreener.com/latest/dex/tokens/' + tokenAddress, {
            timeout: 300000,
            responseType: 'json'
        });
        let marketdataResult = this.createMarketdataCheckResult(marketdataResponse.data.pairs[0]);
        marketdataResult.address = tokenAddress;
        return marketdataResult;
    }

    private createMarketdataCheckResult(marketdata: any): MarketdataCheckResult {
        const metadataCheckResult = new MarketdataCheckResult();
        metadataCheckResult.priceSol = marketdata.priceNative;
        metadataCheckResult.priceUsd = marketdata.priceUsd;
        metadataCheckResult.liquidityUsd = marketdata.liquidity.usd;
        metadataCheckResult.fdv = marketdata.fdv;
        metadataCheckResult.volume24h = marketdata.volume.h24;
        metadataCheckResult.volume6h = marketdata.volume.h6;
        metadataCheckResult.volume1h = marketdata.volume.h1;
        metadataCheckResult.volume5m = marketdata.volume.m5;
        metadataCheckResult.priceChange24h = marketdata.priceChange.h24;
        metadataCheckResult.priceChange6h = marketdata.priceChange.h6;
        metadataCheckResult.priceChange1h = marketdata.priceChange.h1;
        metadataCheckResult.priceChange5m = marketdata.priceChange.m5;
        metadataCheckResult.buys24h = marketdata.txns.h24.buys;
        metadataCheckResult.buys6h = marketdata.txns.h6.buys;
        metadataCheckResult.buys1h = marketdata.txns.h1.buys;
        metadataCheckResult.buys5m = marketdata.txns.m5.buys;
        metadataCheckResult.sells24h = marketdata.txns.h24.sells;
        metadataCheckResult.sells6h = marketdata.txns.h6.sells;
        metadataCheckResult.sells1h = marketdata.txns.h1.sells;
        metadataCheckResult.sells5m = marketdata.txns.m5.sells;
        return metadataCheckResult;
    }
}
