import {
    DEFANGED_DOMAIN_PATTERN,
    DEFANGED_IPV4_PATTERN,
    DEFANGED_IPV6_PATTERN,
} from "./iocPatterns";

const IPV4_REGEX = new RegExp(DEFANGED_IPV4_PATTERN, "g");
const IPV6_REGEX = new RegExp(DEFANGED_IPV6_PATTERN, "gi");
const DOMAIN_REGEX = new RegExp(DEFANGED_DOMAIN_PATTERN, "gi");

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
