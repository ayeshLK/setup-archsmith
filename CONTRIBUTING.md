# Contributing to Setup ArchSmith

Thank you for helping improve Setup ArchSmith. Contributions can include bug fixes, tests, documentation,
cross-platform improvements, and focused enhancements that preserve the action's setup-only responsibility.

## Before you start

- Search [existing issues](https://github.com/ayeshLK/setup-archsmith/issues) before opening a new one.
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

## Making changes

- Edit the TypeScript source in `src/`, not the generated bundle in `dist/`.
- Add or update tests in `test/` for behavioral changes and failures.
- Keep `action.yml`, README examples, and tests synchronized when changing an input or output.
- Use `*.archsmith.json` in documentation examples.
- Update dependencies through npm, pin direct dependencies exactly, and commit `package-lock.json` changes.
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

Maintainers may ask for a change to be split when unrelated concerns are combined.

## Releases

Releases and Marketplace publication are maintainer tasks. Contributors should not create release tags or modify the
moving `v0` tag. Maintainers use the repository's `Release` workflow and complete the Marketplace confirmation in the
GitHub release interface.

## License

By contributing, you agree that your contribution is licensed under the repository's
[Apache License 2.0](LICENSE).
