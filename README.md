# Setup ArchSmith

[![CI](https://github.com/ayeshLK/setup-archsmith/actions/workflows/ci.yml/badge.svg)](https://github.com/ayeshLK/setup-archsmith/actions/workflows/ci.yml)
[![Integration](https://github.com/ayeshLK/setup-archsmith/actions/workflows/integration.yml/badge.svg)](https://github.com/ayeshLK/setup-archsmith/actions/workflows/integration.yml)

Set up the [ArchSmith CLI](https://www.npmjs.com/package/@archsmith/cli) in a GitHub Actions workflow.

This action:

- resolves an exact version from an npm version, range, or dist-tag;
- installs the CLI outside the checked-out repository;
- adds `archsmith` to `PATH` for later steps; and
- exposes the exact installed version as an output.

Validation and rendering remain explicit CLI commands, so file selection and generated outputs stay visible in the
consumer workflow.

## Usage

Node.js 20 or newer and npm must be on `PATH` before Setup ArchSmith runs.

```yaml
name: Validate architecture

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: ayeshLK/setup-archsmith@v0
        with:
          version: "0.5.1"
      - run: archsmith validate docs/architecture.archsmith.json
```

## Inputs

The canonical action contract is defined in [action.yml](action.yml).

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `version` | No | `latest` | npm-compatible version, range, or dist-tag of `@archsmith/cli` to install. |

Supported examples:

```yaml
version: "latest"
version: "0.5.1"
version: "0.5.x"
version: "^0.5.0"
```

For reproducible CI, use an exact CLI version. A range or dist-tag is resolved through the public npm registry each
time the action runs and may select a newer release later.

The action version and CLI version are independent:

- `ayeshLK/setup-archsmith@v0` selects the setup action implementation.
- `version: "0.5.1"` selects the ArchSmith CLI release.

## Outputs

| Name | Description |
| --- | --- |
| `version` | Exact installed version of `@archsmith/cli`. |

Use an `id` to reference the output in later steps:

```yaml
- id: archsmith
  uses: ayeshLK/setup-archsmith@v0
  with:
    version: "0.5.x"
- run: echo "Installed ArchSmith ${{ steps.archsmith.outputs.version }}"
```

## Examples

### Validate and render

`*.archsmith.json` is the recommended filename convention, although the CLI can process any explicitly supplied
JSON file path.

```yaml
- run: archsmith validate docs/payments.archsmith.json
- run: archsmith render docs/payments.archsmith.json -o docs/payments.svg
```

### Validate multiple files

Use a static matrix for several files. Each matrix entry is a separate job and therefore installs the CLI
independently.

```yaml
jobs:
  validate:
    strategy:
      fail-fast: false
      matrix:
        file:
          - docs/payments.archsmith.json
          - docs/identity.archsmith.json
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: ayeshLK/setup-archsmith@v0
        with:
          version: "0.5.1"
      - run: archsmith validate "${{ matrix.file }}"
```

### Render multiple files

Use explicit input and output paths in the matrix:

```yaml
strategy:
  matrix:
    diagram:
      - input: docs/payments.archsmith.json
        output: docs/payments.svg
      - input: docs/identity.archsmith.json
        output: docs/identity.svg

steps:
  # checkout, setup-node, and setup-archsmith steps omitted
  - run: archsmith render "${{ matrix.diagram.input }}" -o "${{ matrix.diagram.output }}"
```

## Requirements and compatibility

The compatibility workflow tests these runner and Node.js combinations:

| Runner | Node.js versions |
| --- | --- |
| Ubuntu | 20, 22, 24 |
| macOS | 20 |
| Windows | 20 |

Self-hosted runners must provide:

- Node.js 20 or newer on `PATH`;
- npm on `PATH`; and
- access to the public npm registry.

## Permissions

Setup ArchSmith does not use `GITHUB_TOKEN` or call GitHub APIs. A workflow that checks out repository files can use
the least-privilege setting:

```yaml
permissions:
  contents: read
```

## How it works

The action validates its prerequisites and version input, resolves the request to an exact published version,
installs that version in a runner temporary directory, verifies the package and executable, adds its executable
directory to `PATH`, and emits the exact `version` output.

It does not modify checked-out files or repository history. Cross-run caching, file discovery, validation, rendering,
commits, pull-request comments, hosted SVGs, and artifact management are intentionally outside its scope.

## Releases and security

During the `0.x` series, `v0` is a moving major tag and releases such as `v0.1.0` identify action versions. For
security-sensitive workflows, pin the action to a full commit SHA and use Dependabot or another controlled process
to review updates.

Pin the `version` input to an exact CLI version when reproducibility matters. Setup ArchSmith passes validated values
to npm as process arguments without shell interpolation and installs into an isolated runner directory.

## Troubleshooting

- **Node.js is unsupported:** add `actions/setup-node` before this action and select Node.js 20 or newer.
- **Version cannot be resolved:** confirm the version, range, or dist-tag exists on the public npm registry and that
  the runner can access `registry.npmjs.org`.
- **npm is unavailable:** use an official GitHub-hosted runner or install Node.js with npm before this action.
- **Installation verification fails:** enable Actions debug logging and confirm the selected CLI version supports the
  runner platform.
- **`archsmith` is unavailable in the same step:** use it in a later step; updates written to `GITHUB_PATH` apply to
  subsequent workflow steps.

## Development

```sh
npm ci
npm run check
```

The generated `dist/` bundle is committed because JavaScript actions execute it directly. CI rebuilds the bundle and
fails if the committed output is stale.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
