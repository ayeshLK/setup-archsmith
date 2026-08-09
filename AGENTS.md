# AGENTS.md

## Scope

These instructions apply to the entire repository. This is a single GitHub Action, not a monorepo. Keep changes
focused on installing the ArchSmith CLI; validation, rendering, file discovery, caching, repository writes, and pull
request automation are outside the action's current scope.

## Repository map

- `action.yml` defines the public action contract and JavaScript runtime.
- `src/` contains the maintainable TypeScript source.
- `test/` contains Vitest unit tests.
- `dist/` is the generated JavaScript Action bundle consumed by GitHub runners and must be committed.
- `.github/workflows/ci.yml` validates source and bundle consistency.
- `.github/workflows/integration.yml` tests supported operating-system and Node.js combinations.
- `.github/workflows/release.yml` prepares releases, maintains `v0`, and smoke-tests published releases.
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md` define contributor intake templates.
- `SECURITY.md` and `CODE_OF_CONDUCT.md` define private reporting and community standards.

## Development setup

Use Node.js 20 or newer and npm.

```sh
npm ci
```

Do not commit `node_modules/`, coverage output, logs, or local environment files.

## Required checks

Run the complete local check before finishing a code change:

```sh
npm run check
git diff --check
git diff --exit-code -- dist
```

`npm run check` typechecks, runs the unit tests, and rebuilds `dist/`. The final `git diff` command confirms that the
generated bundle was committed after a source change. Documentation-only changes do not require rebuilding the
bundle, but YAML examples and workflow files must remain valid YAML.

## Implementation invariants

- Treat action inputs, npm registry responses, executable output, and environment values as untrusted data.
- Pass values to child processes as argument arrays. Never interpolate an input into a shell command.
- Resolve a version, range, or dist-tag to one exact published version before installation.
- Install outside the checked-out consumer repository, using the runner temporary directory.
- Check the consumer workflow's `node` executable on `PATH`; the JavaScript Action runtime version is not a substitute.
- Require Node.js 20 or newer and an executable npm installation.
- Verify installed package metadata and execute `archsmith --version` before modifying `PATH` or setting outputs.
- Keep failure messages actionable and avoid including captured stderr that may contain credentials or registry URLs.
- Use Node path and filesystem APIs for cross-platform behavior. Preserve Windows `.cmd` executable handling.
- Do not add cross-run caching unless a separately approved design defines invalidation and security behavior.

## Tests

- Add or update unit tests for every behavior change, including error paths.
- Keep external npm calls mocked in unit tests.
- Preserve coverage for exact versions, ranges, dist-tags, unsupported Node.js, installation paths, outputs, and
  secret-safe failures.
- If platform or PATH behavior changes, update the integration matrix where appropriate.
- If the public input or output contract changes, update `action.yml`, tests, README examples, and release guidance in
  the same change.

## Dependencies and generated files

- Pin direct production and development dependencies to exact versions and commit `package-lock.json`.
- Use npm to update dependency metadata and the lockfile.
- Never edit files in `dist/` manually. Run `npm run build` and commit all resulting bundle changes with the source.
- Review dependency updates for their Node.js runtime requirements before adopting them.

## Documentation

- Use `*.archsmith.json` as the recommended IR filename in examples while noting that explicit JSON paths remain
  supported.
- Recommend exact CLI versions for reproducible workflows.
- Keep the action version (`ayeshLK/setup-archsmith@v0`) distinct from the CLI `version` input.
- Do not document deferred functionality as if the action implements it.

## Git and releases

- Keep commits atomic and use Conventional Commit-style subjects such as `feat:`, `fix:`, `test:`, `ci:`, and `docs:`.
- Do not rewrite unrelated user changes.
- Releases are maintainer operations. Use the `Release` workflow rather than manually creating or moving release tags.
- Do not publish releases, move `v0`, or change Marketplace metadata unless the user explicitly requests it.

## Pull requests

Summarize the user-visible effect, call out action contract or compatibility changes, and list the checks run. Keep
pull requests narrowly scoped and include source, tests, generated bundle, and documentation together when they form
one behavioral change.
