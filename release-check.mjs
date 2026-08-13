import { readFileSync } from "node:fs";
import process from "node:process";

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;
if (!tag) {
    throw new Error("Provide the release tag as an argument or GITHUB_REF_NAME.");
}
if (!/^\d+\.\d+\.\d+$/.test(tag)) {
    throw new Error(`Release tag must use x.y.z without a prefix; received ${tag}.`);
}

const packageJson = readJson("package.json");
const manifest = readJson("manifest.json");
const versions = readJson("versions.json");

if (packageJson.version !== tag) {
    throw new Error(`package.json version ${packageJson.version} does not match tag ${tag}.`);
}
if (manifest.version !== tag) {
    throw new Error(`manifest.json version ${manifest.version} does not match tag ${tag}.`);
}
if (versions[tag] !== manifest.minAppVersion) {
    throw new Error(
        `versions.json must map ${tag} to manifest minAppVersion ${manifest.minAppVersion}.`,
    );
}

globalThis.console.log(`Release metadata is consistent for ${tag}.`);
