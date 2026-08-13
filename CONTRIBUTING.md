# Contributing to IOC Lens

Thanks for helping improve IOC Lens.

## Development setup

1. Install Node.js 20 or newer.
2. Run `npm ci`.
3. Run `npm run lint`, `npm test`, and `npm run build` before opening a pull request.

For interactive development, run `npm run dev` and copy or link `main.js` and
`manifest.json` into an Obsidian test vault under
`.obsidian/plugins/ioc-lens/`.

## Pull requests

- Keep changes focused and describe their user-visible impact.
- Add or update documentation when behavior changes.
- Do not include real active indicators, secrets, or private incident data in
  issues, fixtures, screenshots, or examples. Use reserved example values.
- Confirm that indicator pivots require an explicit user action and that IOC
  values are not rendered as clickable links.

By contributing, you agree that your contribution is licensed under the
repository's GPL-3.0-only license.
