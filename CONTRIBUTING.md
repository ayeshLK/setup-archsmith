# Contributing to Setup ArchSmith

Thank you for helping improve Setup ArchSmith. Contributions can include bug fixes, tests, documentation,
cross-platform improvements, and focused enhancements that preserve the action's setup-only responsibility.

## Before you start

- Search [existing issues](https://github.com/ayeshLK/setup-archsmith/issues) before opening a new one.
- Follow the project's [Code of Conduct](CODE_OF_CONDUCT.md) in all project spaces.
- Report suspected vulnerabilities privately according to the [Security Policy](SECURITY.md), not in a public issue.
- Small fixes and documentation improvements can go directly to a pull request.
- For a new input, output, dependency, caching behavior, or other significant design change, open an issue first so
  the public contract and compatibility impact can be discussed.
- Never include credentials, npm tokens, private registry URLs, or other secrets in issues, logs, fixtures, or pull
  requests.

## Development setup

You need Git, Node.js 20 or newer, and npm.

```sh
git clone https://github.com/ayeshLK/setup-archsmith.git
cd setup-archsmith
npm ci
```

Create a focused branch from the latest `main` before making changes.

## Project boundaries

Setup ArchSmith installs a requested `@archsmith/cli` version and makes `archsmith` available to subsequent workflow
steps. It does not validate or render files, discover IR documents, modify repositories, publish artifacts, or comment
on pull requests. Proposals that expand this boundary should begin with an issue.

The action accepts untrusted workflow input and invokes npm, so changes must avoid shell interpolation and keep error
messages free of captured credentials or sensitive registry details.

Resolution and installation use explicit generic and `@archsmith` scoped settings for `https://registry.npmjs.org/`.
Keep those arguments centralized and identical so repository, user, global, or environment registry configuration
cannot redirect either operation. Do not clear unrelated npm configuration: proxy, custom-CA, and other safe network
settings must continue to work. Tests must use mocked npm calls and must verify failures do not expose captured stderr.

## Making changes

- Edit the TypeScript source in `src/`, not the generated bundle in `dist/`.
- Add or update tests in `test/` for behavioral changes and failures.
- Keep `action.yml`, README examples, and tests synchronized when changing an input or output.
- Use `*.archsmith.json` in documentation examples.
- Update dependencies through npm, pin direct dependencies exactly, and commit `package-lock.json` changes.
- Add a changeset with `npm run changeset` for every user-visible fix or feature. Tests, documentation, and repository
  maintenance with no release impact do not require one.
- If you use a coding agent, review [AGENTS.md](AGENTS.md) first and remain responsible for the submitted changes.

## Verifying changes

Run:

```sh
npm run check
git diff --check
git diff --exit-code -- dist
```

`npm run check` runs the TypeScript check, unit tests, and bundle build. If source or dependencies changed, include the
rebuilt `dist/` files in the same commit. Documentation-only changes do not require a bundle rebuild.

Pull requests also run the CI workflow and the Ubuntu, macOS, Windows, and supported Node.js integration matrix.

## Dependency updates

Dependabot checks npm and GitHub Actions dependencies weekly. Minor and patch updates are grouped by dependency type
to reduce pull request noise; major updates remain separate so their compatibility and runtime effects can be
reviewed independently. Security updates should be reviewed promptly and are never auto-merged.

Every external action used by this repository's workflows must be pinned to a full 40-character commit SHA with the
corresponding release tag in a same-line comment. Dependabot maintains both the SHA and comment. Local actions such
as `uses: ./` and the Release workflow's deliberate smoke test of this repository's moving `v0` tag are exceptions.

When reviewing an npm dependency pull request:

- read the upstream release notes and check Node.js runtime requirements;
- review `package.json` and `package-lock.json` together;
- run `npm run check` and inspect the generated `dist/` changes; and
- merge only after the CI and Integration checks pass.

For GitHub Actions updates, verify that each new SHA belongs to the expected upstream repository, review the release
notes, and merge only after the same required checks pass.

TypeScript remains pinned to the latest `5.9.x` release because `@vercel/ncc` does not yet support the TypeScript 7
compiler. Do not remove the Dependabot ignore rule until the bundling toolchain builds and tests successfully with
TypeScript 7.

## Commits and pull requests

Keep commits atomic and use a short Conventional Commit-style subject where practical, for example:

```text
fix: reject malformed npm version inputs
test: cover Windows executable verification
docs: clarify exact version pinning
```

A pull request should:

- explain the problem and the chosen solution;
- describe user-visible or compatibility effects;
- reference related issues;
- include appropriate tests and documentation;
- include the rebuilt bundle when required; and
- list the checks performed locally.

The pull request template includes checks for testing, generated bundle consistency, documentation, and release
impact. Mark a check as not applicable and explain why when a narrowly scoped change does not require it.

Maintainers may ask for a change to be split when unrelated concerns are combined.

## Releases

Releases and Marketplace publication are maintainer tasks. Contributors should not create release tags or modify the
moving `v0` tag. Maintainers use the repository's `Release` workflow and complete the Marketplace confirmation in the
GitHub release interface.

User-visible pull requests include a file under `.changeset/` that records their semantic-version impact and release
note. When a release is ready, run `npm run release:version` on a dedicated branch. Changesets consumes all pending
entries, selects the highest required bump, updates `package.json` and `CHANGELOG.md`, and npm synchronizes
`package-lock.json`. Review the result, run the required checks, and merge it through a release preparation pull
request before invoking the `Release` workflow with the resulting `v0.x.y` version.

### Protected branch policy

`main` requires the up-to-date `CI` and aggregate `Integration` checks. Force pushes and branch deletion are disabled.
The repository currently has one maintainer, so pull request approvals are not required and administrators are not
subject to branch protection. This avoids requiring a maintainer to approve their own pull request while retaining an
emergency bypass for repository recovery. If the maintainer team grows, enable at least one required approval and
administrator enforcement after confirming that an independent reviewer and a documented recovery path are available.

Normal changes should still use a pull request and pass both required checks. Administrator bypass is reserved for an
active security incident, an unavailable required check, or repair of broken repository automation. Before bypassing,
verify the exact target commit locally and preserve force-push and deletion protections. Afterward, open a tracking
issue, explain the reason and changes, and run or restore the required checks as soon as practical. Never rename the
`CI` or `Integration` jobs without updating branch protection in the same maintenance window.

### Release integrity policy

Release immutability is enabled for the repository. Once a version-specific release such as `v0.1.1` is published, its
tag and assets must not be changed. Correct a bad release by publishing a new patch version; do not replace or reuse a
published version tag.

The floating `v0` tag is deliberately not attached to a GitHub Release. Publishing a stable `v0.x.y` release triggers
the `Release` workflow, which resolves the immutable release tag, moves `v0` to the same commit, and smoke-tests
`ayeshLK/setup-archsmith@v0`. Do not move `v0` manually during a normal release.

For an emergency rollback, first identify a previously published, trusted `v0.x.y` release and verify its commit. Run
the `Release` workflow's normal checks against the intended state when possible, then move only `v0` to that immutable
release commit. Record the rollback in a public issue or security advisory as appropriate, and follow it with a new
patch release. Do not disable release immutability or alter the version-specific tag.

## License

By contributing, you agree that your contribution is licensed under the repository's
[Apache License 2.0](LICENSE).
