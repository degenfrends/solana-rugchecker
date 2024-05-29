const SPLRugchecker = require('./dist/index.js').default;

async function main() {
    const rugCheckConfig = {
        solanaRpcEndpoint: 'https://solana-mainnet.rpc.extrnode.com/036e028d-7094-4f3d-876e-956d6e56f0ff',
        poolFilePath: './all_pools.json'
    };
    const rugChecker = new SPLRugchecker(rugCheckConfig);
    const result = await rugChecker.check('97oWtQfbZMdDbn1jdNciDHm2vnPBR8VT3Ns7vSS7i9cm');
    const score = rugChecker.rugScore(result);
    const isRug = rugChecker.isRug(result);
    console.log(isRug);
}
main();
