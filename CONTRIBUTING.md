# Contributing to GalleryNFT Protocol

Thanks for contributing.

## Ground Rules

- Keep protocol changes backward-aware (events and read paths matter to indexers).
- Prefer explicit event semantics over implicit behavior.
- Add or update tests for every behavioral change.
- Do not commit secrets (`.env`, private keys).

## Development Setup

```bash
nvm use
npm install
npm run compile
npm test
```

## Pull Request Checklist

1. Contract behavior change explained in PR description.
2. Tests added/updated in `test/`.
3. Docs updated when interface/events change:
   - `docs/contract-methods.md`
   - `docs/contract-overview.md`
   - `docs/integration-guide.md`
4. No generated/local artifacts committed (`artifacts/`, `cache/`, `node_modules/`).

## Commit Guidance

Use small, reviewable commits with imperative messages:

- `feat: add batch read helper for item fields`
- `fix: enforce gallery controller guard on setGalleryFields`
- `docs: update integration guide for new event field`

## Security Reporting

If you find a security issue, do not open a public issue with exploit details.
Open a minimal issue requesting private contact, or coordinate privately with maintainers first.
