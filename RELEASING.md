# Releasing IOC Lens

Releases use semantic versions in `x.y.z` form. Git tags must exactly match the
version and must not use a `v` prefix.

## Prepare the release

1. Merge the intended changes to `main` and confirm the CI check passes.
2. Decide whether `manifest.json` still declares the correct minimum supported
   Obsidian version.
3. Run `npm ci` and `npm run check`.
4. Run `npm version patch` (or `minor`/`major` as appropriate). This updates
   `package.json`, `package-lock.json`, `manifest.json`, and `versions.json`,
   then creates the matching commit and tag.
5. Inspect the version commit and run `npm run verify:release -- <version>`.

## Smoke test the production artifact

Use a disposable test vault containing the generated `main.js` and
`manifest.json`. Copy `tests/fixtures/smoke-test.md` into the vault for safe,
repeatable test data. Do not test plugin development in a production vault.

Complete this checklist on both Obsidian 1.7.2 and the current stable release:

- Enable the plugin, then disable and re-enable it without errors.
- Open, close, and reopen the IOC Lens sidebar.
- Open `smoke-test.md` and confirm each expected category is populated
  correctly without extracting the adjacent invalid values.
- Switch rapidly between notes and edit the active note; confirm the sidebar
  never displays results from a previously active note.
- Start once online, then restart offline; confirm cached TLD validation works
  and a failed refresh does not prevent the plugin from loading.
- Load settings created by the previous released version and confirm search
  provider enablement plus MD5/SHA256 choices are preserved.
- Exercise each enabled pivot with reserved example indicators. Confirm the URL
  is correctly encoded and no pivot opens without an explicit click.

## Publish

1. Push the version commit and tag: `git push origin main --follow-tags`.
2. Wait for the release workflow to pass. It validates the version metadata,
   rebuilds the plugin, attests the artifacts, and creates a draft release.
3. Review the generated notes and confirm the draft contains `main.js` and
   `manifest.json`.
4. Publish the draft release.
5. Install or update IOC Lens through Obsidian and perform a final short smoke
   test.

If the workflow fails after a tag has been pushed, fix the problem and create a
new patch version. Do not move or reuse a published version tag.
