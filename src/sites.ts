export const VT_SEARCH = 'https://virustotal.com/gui/search/%s';
export const IPDB_SEARCH = 'https://abuseipdb.com/check/%s';
export const GOOGLE_SEARCH = 'https://google.com/search?q="%s"';
export const URLSCAN_SEARCH = 'https://urlscan.io/search/#%s';
export const SPUR_SEARCH = 'https://app.spur.us/context?q=%s';
export const SHODAN_SEARCH = 'https://www.shodan.io/host/%s';
export const CENSYS_SEARCH = 'https://search.censys.io/hosts/%s';
export const DDG_SEARCH = 'https://duckduckgo.com/?q="%s"';
export const BAZAAR_SEARCH_SHA256 = 'https://bazaar.abuse.ch/browse.php?search=sha256%3A%s';
export const BAZAAR_SEARCH_MD5 = 'https://bazaar.abuse.ch/browse.php?search=md5%3A%s';
export const GREYNOISE_SEARCH = 'https://viz.greynoise.io/ip/%s';


export interface ParsedIndicators {
    title: string;
    items: string[];
    sites: SearchSite[] | undefined;
}

export interface SearchSite {
    name: string
    shortName: string
    description?: string
    site: string
    ip: boolean
    hash: boolean
    domain: boolean
    multisearch: boolean
    separator?: string
    enabled: boolean
}

export const greynoiseSearch: SearchSite = {
    name: 'GreyNoise',
    shortName: 'GN',
    description: 'Provides context and reputation for IP addresses involved in internet scanning.',
    site: GREYNOISE_SEARCH,
    ip: true,
    hash: false,
    domain: false,
    multisearch: false,
    enabled: true
}

export const vtSearch: SearchSite = {
    name: 'VirusTotal',
    shortName: 'VT',
    description: 'VirusTotal inspects items with over 70 antivirus scanners and URL/domain blocklisting services.',
    site: VT_SEARCH,
    ip: true,
    hash: true,
    domain: true,
    multisearch: true,
    separator: '%20',
    enabled: true
}

export const ipdbSearch: SearchSite = {
    name: 'AbuseIPDB',
    shortName: 'IPDB',
    description: 'Check an IP address, domain name, or subnet to see if it\'s been reported.',
    site: IPDB_SEARCH,
    ip: true,
    hash: false,
    domain: true,
    multisearch: false,
    enabled: true
}

export const ddgSearch: SearchSite = {
    name: 'DuckDuckGo',
    shortName: 'DuckDuckGo',
    description: 'A general, privacy-focused web search engine.',
    site: DDG_SEARCH,
    ip: true,
    hash: true,
    domain: true,
    multisearch: false,
    enabled: false
}

export const googleSearch: SearchSite = {
    name: 'Google',
    shortName: 'Google',
    description: 'A general web search engine.',
    site: GOOGLE_SEARCH,
    ip: true,
    hash: true,
    domain: true,
    multisearch: false,
    enabled: true
}

export const urlscanSearch: SearchSite = {
    name: 'URLScan',
    shortName: 'URLScan',
    description: 'A free service to scan and analyze websites.',
    site: URLSCAN_SEARCH,
    ip: true,
    hash: false,
    domain: true,
    multisearch: false,
    enabled: false
}

export const shodanSearch: SearchSite = {
    name: 'Shodan',
    shortName: 'Shodan',
    description: 'A search engine for internet-connected devices.',
    site: SHODAN_SEARCH,
    ip: true,
    hash: false,
    domain: false,
    multisearch: false,
    enabled: false
}

export const censysSearch: SearchSite = {
    name: 'Censys',
    shortName: 'Censys',
    description: 'A database of internet intelligence.',
    site: CENSYS_SEARCH,
    ip: true,
    hash: false,
    domain: true,
    multisearch: false,
    enabled: false
}

export const spurSearch: SearchSite = {
    name: 'Spur',
    shortName: 'Spur',
    description: 'Identifies VPN entry/exit, residential proxies, geo concentration, and more. Free account required to retrieve results.',
    site: SPUR_SEARCH,
    ip: true,
    hash: false,
    domain: false,
    multisearch: false,
    enabled: false
}

export const defaultSites: SearchSite[] = [
    vtSearch,
    ipdbSearch,
    googleSearch,
    ddgSearch,
    urlscanSearch,
    shodanSearch,
    censysSearch,
    spurSearch,
    greynoiseSearch
];
