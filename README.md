# Solana Rugchecker

![Static Badge](https://img.shields.io/badge/degen-100%25-pink) ![NPM Version](https://img.shields.io/npm/v/@degenfrends/solana-rugchecker)
![NPM Downloads](https://img.shields.io/npm/dw/@degenfrends/solana-rugchecker)

![Discord](https://img.shields.io/discord/1242753898964582440)
![X (formerly Twitter) URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fkryptobrah&label=Twitter%2FX)

## Currently the rug check is only based on the token's metadata! Don't base any decision on the results of this check! I will add top holders and liquidity pool analysis in the next days/week. I am not a JavaScript developer, so I am pretty sure I didn't really got the concept of asynchronous programming. If someone has too much time, [join the discord](https://discord.gg/4cEuF4Dzw4) and teach me what I did wrong, or fork it and do it better!

SPLRugchecker is a TypeScript class that checks if a Solana token is a potential rug pull. It uses the `MetadataChecker` class to check the token's
metadata and provides methods to calculate a rug score and determine if the token is a potential rug pull.

## Installation

Just install it with npm or yarn or whatever.

```bash
npm install "@degenfrends/solana-rugchecker"
```

## Configuration

To create an instance of `SPLRugchecker`, you need to provide a `RugCheckConfig` object with the `solanaRpcEndpoint` property. But if you want to use
environment variables for the configuration, that's possible too.

### 1. Configuration without environment variables

```typescript
const rugCheckConfig = {
    solanaRpcEndpoint: 'https://api.devnet.solana.com'
};
const rugChecker = new SPLRugchecker(rugCheckConfig);
```

### 2. Configuration with environment variables

If you want to configure the rug checker with environment variables, you need to define a `SOLANA_RPC_ENDPOINT` variable and pass an empty object `{}`
in the constructor.

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
import SPLRugchecker from '@degenfrends/solana-rugchecker';

const rugCheckConfig = {
    solanaRpcEndpoint: 'https://api.devnet.solana.com'
};
const rugChecker = new SPLRugchecker(rugCheckConfig);
const result = await rugChecker.check('tokenAddress');
const score = rugChecker.rugScore(result);
const isRug = rugChecker.isRug(result);
```
