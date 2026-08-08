# Setup ArchSmith

[Setup ArchSmith](https://github.com/ayeshLK/setup-archsmith) installs a requested version of
[`@archsmith/cli`](https://www.npmjs.com/package/@archsmith/cli) and adds `archsmith` to `PATH` for later
workflow steps. Validation and rendering remain explicit, visible CLI commands in your workflow.

## Quick start

Node.js 20 or newer and npm must be available before this action runs.

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 20
  - uses: ayeshLK/setup-archsmith@v0
    with:
      version: 0.5.1
  - run: archsmith validate docs/architecture.ir.json
```

The `version` input accepts an exact npm version, a range, or a dist-tag and defaults to `latest`:

```yaml
version: latest
version: 0.5.1
version: 0.5.x
version: ^0.5.0
```

For reproducible CI, prefer an exact CLI version. The action resolves every input to one published version before
installation and exposes that exact version as an output:

```yaml
- id: archsmith
  uses: ayeshLK/setup-archsmith@v0
  with:
    version: 0.5.x
- run: echo "Installed ArchSmith ${{ steps.archsmith.outputs.version }}"
```

## Validate and render

Each command handles one IR file:

```yaml
- run: archsmith validate docs/payments.ir.json
- run: archsmith render docs/payments.ir.json -o docs/payments.svg
```

Use a static matrix for several files. Each matrix entry is a separate job, so it installs the CLI independently.

```yaml
jobs:
  validate:
    strategy:
      fail-fast: false
      matrix:
        file:
          - docs/payments.ir.json
          - docs/identity.ir.json
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: ayeshLK/setup-archsmith@v0
        with:
          version: 0.5.1
      - run: archsmith validate "${{ matrix.file }}"
```

Rendering can make both paths explicit:

```yaml
strategy:
  matrix:
    diagram:
      - input: docs/payments.ir.json
        output: docs/payments.svg
      - input: docs/identity.ir.json
        output: docs/identity.svg

steps:
  # checkout, setup-node, and setup-archsmith steps omitted
  - run: archsmith render "${{ matrix.diagram.input }}" -o "${{ matrix.diagram.output }}"
```

## Compatibility

CI tests Ubuntu with Node.js 20, 22, and 24, plus macOS and Windows with Node.js 20. The action installs into a
runner temporary directory; it does not modify checked-out files or repository history.

## Releases and security

Action and CLI versions are independent. `ayeshLK/setup-archsmith@v0` follows compatible `0.x` action releases,
while the `version` input selects the CLI. Tagged releases such as `v0.1.0` are immutable. Security-sensitive
workflows should pin the action to a full commit SHA and use Dependabot or another controlled process for updates.

## Troubleshooting

- **Node.js is unsupported:** add `actions/setup-node` before this action and select Node.js 20 or newer.
- **Version cannot be resolved:** confirm the exact version, range, or dist-tag exists on the public npm registry and
  that the runner can access `registry.npmjs.org`.
- **npm is unavailable:** use an official GitHub-hosted runner or install Node.js with npm before this action.
- **Installation verification fails:** rerun with Actions debug logging enabled and verify the selected CLI version
  supports the runner platform.

## Scope

This action only installs ArchSmith and configures `PATH`. Cross-run caching, batch/glob discovery, validation,
rendering, commits, pull-request comments, hosted SVGs, and artifact management are intentionally deferred.

## Development

```sh
npm ci
npm run check
```

The generated `dist/` bundle is committed because JavaScript actions execute it directly.
