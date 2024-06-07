import WebsiteCheckResult from '../model/result/website-check';
const whois = require('whois-json');

export default class WebsiteChecker {
    constructor() {}
    async check(website: string): Promise<WebsiteCheckResult> {
        const result = await (async function () {
            var results = await whois(website);
            return results;
        })();
        const websiteCheckResult = new WebsiteCheckResult();
        websiteCheckResult.address = website;
        websiteCheckResult.createdAt = new Date(result.creationDate);
        websiteCheckResult.reseller = result.reseller;
        websiteCheckResult.registrarUrl = result.registrarUrl;
        websiteCheckResult.nameServer = result.nameServer;
        websiteCheckResult.registrantName = result.registrantName;
        websiteCheckResult.registrantOrganization = result.registrantOrganization;
        websiteCheckResult.registrantStreet = result.registrantStreet;
        websiteCheckResult.registrantCity = result.registrantCity;
        websiteCheckResult.registrantStateProvince = result.registrantStateProvince;
        websiteCheckResult.registrantPostalCode = result.registrantPostalCode;
        websiteCheckResult.registrantCountry = result.registrantCountry;
        websiteCheckResult.registrantPhone = result.registrantPhone;
        websiteCheckResult.registrantEmail = result.registrantEmail;

        return websiteCheckResult;
    }
}
