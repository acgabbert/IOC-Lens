import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const testDirectory = dirname(fileURLToPath(import.meta.url));

async function importTypeScript(relativePath) {
    const result = await build({
        entryPoints: [resolve(testDirectory, relativePath)],
        bundle: true,
        format: "esm",
        platform: "node",
        target: "node20",
        write: false,
    });
    const moduleUrl = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString("base64")}`;
    return import(moduleUrl);
}

const {
    findIndicators,
    isPrivateIpv4,
    parseTldList,
    refangIndicator,
    uniqueIndicators,
    validateDomains,
} = await importTypeScript("../src/ioc.ts");

const { normalizeSettings, reconcileSearchSites } = await importTypeScript("../src/settingsData.ts");
const { defangText } = await importTypeScript("../src/iocUtils.ts");

test("finds fanged and commonly defanged IPv4 indicators", () => {
    assert.deepEqual(
        findIndicators("8.8.8.8 10[.]0[.]0[.]1 192(.)168(.)1(.)2 1\\.1\\.1\\.1", "IPv4"),
        ["8.8.8.8", "10[.]0[.]0[.]1", "192(.)168(.)1(.)2", "1\\.1\\.1\\.1"],
    );
});

test("rejects invalid IPv4 octets", () => {
    assert.deepEqual(findIndicators("999.1.1.1 and 256.0.0.1", "IPv4"), []);
});

test("finds domains and bounded hashes", () => {
    const sha256 = "A".repeat(64);
    const md5 = "b".repeat(32);
    assert.deepEqual(findIndicators("example[.]com and sub.example.org", "Domain"), ["example[.]com", "sub.example.org"]);
    assert.deepEqual(findIndicators(`${sha256} ${sha256}f`, "SHA256"), [sha256]);
    assert.deepEqual(findIndicators(`${md5} a${md5}`, "MD5"), [md5]);
});

test("finds compressed IPv6 indicators", () => {
    assert.deepEqual(findIndicators("2001:db8::1 and fe80::abcd", "IPv6"), ["2001:db8::1", "fe80::abcd"]);
});

test("refangs and normalizes indicators", () => {
    assert.equal(refangIndicator("HXXPS[://]EXAMPLE[.]COM"), "https://example.com");
    assert.equal(refangIndicator("USER[at]EXAMPLE(.)COM"), "user@example.com");
});

test("defangs indicators using the shared canonical patterns", () => {
    assert.equal(
        defangText("Visit https://example.com with 8.8.8.8 or 2001:db8::1"),
        "Visit hxxps[://]example[.]com with 8[.]8[.]8[.]8 or 2001[:]db8[::]1",
    );
});

test("defanging is idempotent", () => {
    const defanged = "hxxps[://]example[.]com 8[.]8[.]8[.]8 2001[:]db8[::]1";
    assert.equal(defangText(defanged), defanged);
});

test("classifies RFC 1918 and loopback IPv4 ranges after refanging", () => {
    for (const ip of ["10[.]0[.]0[.]1", "127.0.0.1", "172.16.0.1", "172.31.255.255", "192.168.1.1"]) {
        assert.equal(isPrivateIpv4(ip), true, ip);
    }
    for (const ip of ["8.8.8.8", "172.15.0.1", "172.32.0.1", "192.169.1.1"]) {
        assert.equal(isPrivateIpv4(ip), false, ip);
    }
});

test("deduplicates without changing first-seen order", () => {
    assert.deepEqual(uniqueIndicators(["b", "a", "b", "c", "a"]), ["b", "a", "c"]);
});

test("validates fanged and defanged domains without mutating input", () => {
    const domains = ["example.com", "example[.]ORG", "bad.invalid"];
    assert.deepEqual(validateDomains(domains, ["COM", "org"]), ["example.com", "example[.]ORG"]);
    assert.deepEqual(domains, ["example.com", "example[.]ORG", "bad.invalid"]);
});

test("parses the IANA TLD file format", () => {
    assert.deepEqual(parseTldList("# Version 1\r\nCOM\r\norg\r\n\r\n"), ["COM", "ORG"]);
});

const defaultSettings = {
    validTld: [],
    searchSites: [{
        name: "Example",
        shortName: "EX",
        site: "https://example.com/%s",
        ip: true,
        hash: false,
        domain: true,
        multisearch: false,
        enabled: true,
    }],
    sha256Enabled: true,
    md5Enabled: true,
};

test("normalizes missing and malformed settings", () => {
    assert.deepEqual(normalizeSettings(null, defaultSettings), defaultSettings);
    assert.deepEqual(normalizeSettings({
        validTld: [" com ", 7, "COM", "org"],
        searchSites: [{ name: "incomplete" }, defaultSettings.searchSites[0]],
        sha256Enabled: false,
        md5Enabled: "yes",
    }, defaultSettings), {
        ...defaultSettings,
        validTld: ["COM", "ORG"],
        searchSites: defaultSettings.searchSites,
        sha256Enabled: false,
    });
});

test("settings normalization does not share mutable defaults", () => {
    const normalized = normalizeSettings(undefined, defaultSettings);
    normalized.searchSites[0].enabled = false;
    assert.equal(defaultSettings.searchSites[0].enabled, true);
});

test("search-site reconciliation reports unchanged settings", () => {
    assert.deepEqual(reconcileSearchSites(defaultSettings.searchSites, defaultSettings.searchSites), {
        searchSites: defaultSettings.searchSites,
        changed: false,
    });
});

test("search-site reconciliation adds defaults while preserving user choices", () => {
    const stored = [{ ...defaultSettings.searchSites[0], enabled: false }];
    const added = {
        ...defaultSettings.searchSites[0],
        name: "Added",
        shortName: "NEW",
    };
    assert.deepEqual(reconcileSearchSites(stored, [defaultSettings.searchSites[0], added]), {
        searchSites: [stored[0], added],
        changed: true,
    });
});
