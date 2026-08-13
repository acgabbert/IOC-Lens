// Patterns adapted from obsidian-cyber-utils, originally authored for IOC Lens.
const ipv4Octet = "(?:25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])";
const ipv6Octet = "[0-9a-fA-F]{1,4}";

function possiblyDefanged(value: string): string {
    return String.raw`[\[\(\\]?${value}[\]\)]?`;
}

const IPV4_REGEX = new RegExp(
    String.raw`(?:%[0-9a-fA-F]{2})?(?=\b|^)(` +
        `(?:${ipv4Octet + possiblyDefanged(String.raw`\.`)}){3}` +
        ipv4Octet +
        ")",
    "g",
);

const IPV6_REGEX = new RegExp(
    `((?:${ipv6Octet}${possiblyDefanged(":")}){7}${ipv6Octet}|` +
        `(?:(?:${ipv6Octet}${possiblyDefanged(":")})*${ipv6Octet})?${possiblyDefanged("::")}` +
        `(?:(?:${ipv6Octet}${possiblyDefanged(":")})*${ipv6Octet})?)`,
    "gi",
);

const DOMAIN_REGEX = new RegExp(
    String.raw`(?:%[0-9a-f]{2})?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?` +
        possiblyDefanged(String.raw`\.`) +
        String.raw`)+[a-z][a-z0-9-]{0,61}[a-z](?=\.?)\b)`,
    "gi",
);

const hashStart = "(?:%[0-9a-f]{2})?(?<=^|[^a-f0-9]+)";
const hashEnd = "(?=$|[^a-f0-9]+)";

const SHA256_REGEX = new RegExp(`${hashStart}([a-f0-9]{64})${hashEnd}`, "gi");
const MD5_REGEX = new RegExp(`${hashStart}([a-f0-9]{32})${hashEnd}`, "gi");

export type IndicatorPattern = "IPv4" | "IPv6" | "Domain" | "SHA256" | "MD5";

const patterns: Record<IndicatorPattern, RegExp> = {
    IPv4: IPV4_REGEX,
    IPv6: IPV6_REGEX,
    Domain: DOMAIN_REGEX,
    SHA256: SHA256_REGEX,
    MD5: MD5_REGEX,
};

export function findIndicators(text: string, pattern: IndicatorPattern): string[] {
    const matcher = new RegExp(patterns[pattern].source, patterns[pattern].flags);
    return Array.from(text.matchAll(matcher), match => match[0]);
}

export function refangIndicator(text: string): string {
    return text
        .replaceAll("[.]", ".")
        .replaceAll("(.)", ".")
        .replaceAll(String.raw`\.`, ".")
        .replaceAll("[/]", "/")
        .replaceAll("[//]", "/")
        .replaceAll("[@]", "@")
        .replaceAll("[at]", "@")
        .replaceAll(/hxxp/gi, "http")
        .replaceAll("[:]", ":")
        .replaceAll("[::]", "::")
        .replaceAll("[://]", "://")
        .toLowerCase();
}

export function isPrivateIpv4(ip: string): boolean {
    const [first, second] = refangIndicator(ip).split(".").map(Number);
    return first === 10 ||
        first === 127 ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168);
}

export function uniqueIndicators(indicators: string[]): string[] {
    return [...new Set(indicators)];
}

export function validateDomains(domains: string[], validTlds: string[]): string[] {
    const tlds = new Set(validTlds.map(tld => tld.toUpperCase()));
    return domains.filter(domain => {
        const refanged = refangIndicator(domain);
        const tld = refanged.split(".").pop();
        return tld !== undefined && tlds.has(tld.toUpperCase());
    });
}

export function parseTldList(contents: string): string[] {
    return contents
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith("#"))
        .map(tld => tld.toUpperCase());
}
