# Solana Rugchecker

![Static Badge](https://img.shields.io/badge/degen-100%25-pink)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/degenfrends/solana-rugchecker/publish.yml)
![NPM License](https://img.shields.io/npm/l/%40degenfrends%2Fsolana-rugchecker)
![NPM Version](https://img.shields.io/npm/v/@degenfrends/solana-rugchecker)
![NPM Downloads](https://img.shields.io/npm/dw/@degenfrends/solana-rugchecker)
![GitHub Repo stars](https://img.shields.io/github/stars/degenfrends/solana-rugchecker)
![X (formerly Twitter) URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fkryptobrah&label=Twitter%2FX)

## This project is under development. Results might fail or give false results. Please evaluate your current version yourself, until this notice disappears. [Join the discord if you are looking for fellow degen developers!](https://discord.gg/HUVAbet2Dp)

SPLRugchecker is a TypeScript class that checks if a Solana token is a potential rug pull. It analyzes the blockchain to check the token's metadata,
top holders and liquidity, and provides methods to calculate a rug score and determine if the token is a potential rug pull.

## Installation

Just install it with npm or yarn or whatever.

```bash
npm install "@degenfrends/solana-rugchecker"
```

## Configuration

To create an instance of `SPLRugchecker`, you need to provide a `RugCheckConfig` object with the `solanaRpcEndpoint` and optional `poolFilePath` or
`poolAddress` property. But if you want to use environment variables for the configuration, that's possible too. You need to download the pool file
from https://api.raydium.io/v2/sdk/liquidity/mainnet.json and set the path of the file in the `poolFilePath` property.

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

### Checking a token

To check a token, call the `check` method with the token's address. This method returns a Promise that resolves to a `RugCheckResult` object. With
this result you can do your own calculations whether a token is a rug pull or not.

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
    // If you set this option, you need to provide a downloaded version of this file: https://api.raydium.io/v2/sdk/liquidity/mainnet.json, otherwise the API from geckoterminal.com is used.
    poolFilePath: './mainnet.json',
    // If you set this option, you need to provide the pool address for the token yourself. This might be useful when you build a sniper that is listening on raydium pool creation.
    poolAddress: '97oWtQfbZMdDbn1jdNciDHm2vnPBR8VT3Ns7vSS7i9cm'
};
const rugChecker = new SPLRugchecker(rugCheckConfig);
const result = await rugChecker.check('tokenAddress');
// you can access the detailed results of each check. Log the result to see all information that is returned.
const score = rugChecker.rugScore(result);
const isRug = rugChecker.isRug(result);
```

If you have any questions or suggestions, [join the discord!](https://discord.gg/HUVAbet2Dp)
