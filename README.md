# Solana Rugchecker

![Static Badge](https://img.shields.io/badge/degen-100%25-pink) ![NPM Version](https://img.shields.io/npm/v/@degenfrends/solana-rugchecker)
![NPM Downloads](https://img.shields.io/npm/dw/@degenfrends/solana-rugchecker)

![Discord](https://img.shields.io/discord/1242753898964582440)
![X (formerly Twitter) URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fkryptobrah&label=Twitter%2FX)

## I am not a JavaScript developer, so I am pretty sure I didn't really got the concept of asynchronous programming. And I am not sure if I did everything correct with the npm package. If someone has too much time, [join the discord](https://discord.gg/4cEuF4Dzw4) and teach me what I did wrong, or fork it and do it better!

SPLRugchecker is a TypeScript class that checks if a Solana token is a potential rug pull. It analyzes the blockchain to check the token's metadata,
top holders and liquidity, and provides methods to calculate a rug score and determine if the token is a potential rug pull.

## Installation

Just install it with npm or yarn or whatever.

```bash
npm install "@degenfrends/solana-rugchecker"
```

## Configuration

To create an instance of `SPLRugchecker`, you need to provide a `RugCheckConfig` object with the `solanaRpcEndpoint` and `poolFilePath` property. But
if you want to use environment variables for the configuration, that's possible too. You need to download the pool file from
https://api.raydium.io/v2/sdk/liquidity/mainnet.json and set the path of the file in the `poolFilePath` property.

### 1. Configuration without environment variables

```typescript
const rugCheckConfig = {
    solanaRpcEndpoint: 'https://api.devnet.solana.com'
    poolFilePath: './mainnet.json'
};
const rugChecker = new SPLRugchecker(rugCheckConfig);
```

### 2. Configuration with environment variables

If you want to configure the rug checker with environment variables, you need to define a `SOLANA_RPC_ENDPOINT` variable and pass an empty object `{}`
in the constructor. BE AWARE THAT YOU NEED AN RPC ENDPOINT THAT ALLOWS THE `getTokenLargestAccounts` CALL! HELIUS.DEV IS WORKING WITH THE FREE TIER
FOR EXAMPLE!

```bash
SOLANA_RPC_ENDPOINT="https://api.devnet.solana.com"
```

```typescript
const rugChecker = new SPLRugchecker({});
```

## Usage

Checking a token To check a token, call the `check` method with the token's address. This method returns a Promise that resolves to a `RugCheckResult`
object. With this result you can do your own calculations whether a token is a rug pull or not.

```typescript
const result = await rugChecker.check('tokenAddress');
```

### Calculating the rug score

If you don't want to implement your own logic to determine the likelyness of a rug pull, you can calculate the rug score with the `rugScore` method.

```typescript
const score = rugChecker.rugScore(result);
```

### Determining if a token is a potential rug pull

To determine if a `RugCheckResult` indicates a potential rug pull, call the `isRug` method. This is only necessary if you don't want to determine
yourself, if the token is a rug or not based on the `RugCheckResult` object or the `rugScore`method.

## Full example

```typescript
const SPLRugchecker = require('@degenfrends/solana-rugchecker').default;

const rugCheckConfig = {
    solanaRpcEndpoint: 'https://api.devnet.solana.com'
    poolFilePath: './mainnet.json'
};
const rugChecker = new SPLRugchecker(rugCheckConfig);
const result = await rugChecker.check('tokenAddress');
const score = rugChecker.rugScore(result);
const isRug = rugChecker.isRug(result);
```
