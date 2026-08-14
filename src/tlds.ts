import { requestUrl } from "obsidian";

import { parseTldList } from "./ioc";

const IANA_TLD_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

export async function fetchValidTlds(): Promise<string[] | null> {
    try {
        const response = await requestUrl(IANA_TLD_URL);
        return parseTldList(response.text);
    } catch (error) {
        console.error("Failed to retrieve the IANA top-level domain list", error);
        return null;
    }
}
