const SPLRugchecker = require('./dist/index.js').default;
const WebsiteChecker = require('./dist/index.js').WebsiteChecker;
async function main() {
    const rugCheckConfig = {
        solanaRpcEndpoint: 'https://solana-mainnet.rpc.extrnode.com/036e028d-7094-4f3d-876e-956d6e56f0ff',
        heliusApiKey: '123456-your-api-key'
        //poolFilePath: './all_pools.json'
    };
    const rugChecker = new SPLRugchecker(rugCheckConfig);
    const result = await rugChecker.check('7Hk81bdBwjgfNDvJc6WBzjEw95Rnt5Tts6qJg2Mnt38L');
    const score = rugChecker.rugScore(result);
    const isRug = rugChecker.isRug(result);
    console.log(result);
}
async function website() {
    const website = 'patriotsmonth.xyz';
    const websiteCheck = new WebsiteChecker();
    const result = await websiteCheck.check(website);
    console.log(result);
}
main();
