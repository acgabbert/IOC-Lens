import type { SearchSite } from "./sites";

export interface IocLensSettings {
    validTld: string[];
    searchSites: SearchSite[];
    sha256Enabled: boolean;
    md5Enabled: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSearchSite(value: unknown): value is SearchSite {
    if (!isRecord(value)) return false;

    return typeof value.name === "string" &&
        typeof value.shortName === "string" &&
        typeof value.site === "string" &&
        typeof value.ip === "boolean" &&
        (value.ipv6 === undefined || typeof value.ipv6 === "boolean") &&
        typeof value.hash === "boolean" &&
        typeof value.domain === "boolean" &&
        typeof value.multisearch === "boolean" &&
        (value.separator === undefined || typeof value.separator === "string") &&
        typeof value.enabled === "boolean" &&
        (value.description === undefined || typeof value.description === "string");
}

function normalizeTlds(value: unknown, fallback: string[]): string[] {
    const source = Array.isArray(value) ? value : fallback;
    return [...new Set(
        source
            .filter((tld): tld is string => typeof tld === "string")
            .map(tld => tld.trim().toUpperCase())
            .filter(Boolean),
    )];
}

function normalizeSearchSites(value: unknown, fallback: SearchSite[]): SearchSite[] {
    const source = Array.isArray(value) ? value : fallback;
    return source.filter(isSearchSite).map(site => ({ ...site }));
}

export function normalizeSettings(value: unknown, defaults: IocLensSettings): IocLensSettings {
    const stored = isRecord(value) ? value : {};
    return {
        validTld: normalizeTlds(stored.validTld, defaults.validTld),
        searchSites: normalizeSearchSites(stored.searchSites, defaults.searchSites),
        sha256Enabled: typeof stored.sha256Enabled === "boolean"
            ? stored.sha256Enabled
            : defaults.sha256Enabled,
        md5Enabled: typeof stored.md5Enabled === "boolean"
            ? stored.md5Enabled
            : defaults.md5Enabled,
    };
}

export function reconcileSearchSites(
    storedSites: SearchSite[],
    defaultSites: SearchSite[],
): { searchSites: SearchSite[]; changed: boolean } {
    const searchSites = storedSites.map(site => ({ ...site }));

    for (const defaultSite of defaultSites) {
        const index = searchSites.findIndex(site =>
            site.name === defaultSite.name || site.shortName === defaultSite.shortName,
        );
        const enabled = index >= 0 ? searchSites[index].enabled : defaultSite.enabled;
        const reconciled = { ...defaultSite, enabled };

        if (index >= 0) {
            searchSites[index] = reconciled;
        } else {
            searchSites.push(reconciled);
        }
    }

    return {
        searchSites,
        changed: JSON.stringify(searchSites) !== JSON.stringify(storedSites),
    };
}
