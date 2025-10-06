# sre-app

## Hard-coded string guardrail

Run the following check before opening a pull request to ensure that new UI copy is routed through the shared content catalogs instead of being hard-coded inside React components:

```bash
npm run lint:hardcoded
```

If you intentionally refactor existing literals into localized keys, refresh the baseline with:

```bash
npm run lint:hardcoded:update
```

The baseline lives at `dev/scripts/hardcoded-strings-baseline.json` and tracks every literal that still needs to be externalized.