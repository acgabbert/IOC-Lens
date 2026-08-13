const ipv4Octet = "(?:25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])";
const ipv6Octet = "[0-9a-fA-F]{1,4}";

function separator(value: string, allowDefanged: boolean): string {
    return allowDefanged
        ? String.raw`[\[\(\\]?${value}[\]\)]?`
        : String.raw`(?<![\[\(])${value}(?![\]\)])`;
}

function createIpv4Pattern(allowDefanged: boolean): string {
    const dot = separator(String.raw`\.`, allowDefanged);
    return String.raw`(?:%[0-9a-fA-F]{2})?(?=\b|^)(` +
        `(?:${ipv4Octet + dot}){3}${ipv4Octet})`;
}

function createIpv6Pattern(allowDefanged: boolean): string {
    const colon = separator(":", allowDefanged);
    const doubleColon = separator("::", allowDefanged);
    return `((?:${ipv6Octet}${colon}){7}${ipv6Octet}|` +
        `(?:(?:${ipv6Octet}${colon})*${ipv6Octet})?${doubleColon}` +
        `(?:(?:${ipv6Octet}${colon})*${ipv6Octet})?)`;
}

function createDomainPattern(allowDefanged: boolean): string {
    const dot = separator(String.raw`\.`, allowDefanged);
    return String.raw`(?:%[0-9a-f]{2})?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?` +
        dot +
        String.raw`)+[a-z][a-z0-9-]{0,61}[a-z](?=\.?)\b)`;
}

export const IPV4_PATTERN = createIpv4Pattern(false);
export const DEFANGED_IPV4_PATTERN = createIpv4Pattern(true);
export const IPV6_PATTERN = createIpv6Pattern(false);
export const DEFANGED_IPV6_PATTERN = createIpv6Pattern(true);
export const DOMAIN_PATTERN = createDomainPattern(false);
export const DEFANGED_DOMAIN_PATTERN = createDomainPattern(true);

// URL structure adapted from CyberChef (Apache-2.0).
const protocol = String.raw`[A-Z]+://`;
const hostname = String.raw`[-\w]+(?:\.\w[-\w]*)+`;
const port = String.raw`:\d+`;
const path = String.raw`/[^.!,?"<>[\]{}\s\x7F-\xFF]*(?:[.!,?]+[^.!,?"<>[\]{}\s\x7F-\xFF]+)*`;

export const URL_PATTERN = protocol + hostname + `(?:${port})?(?:${path})?`;
