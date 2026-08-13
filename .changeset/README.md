# Changesets

Changesets record the release impact of pull requests. Add one with `npm run changeset` for any user-visible change,
select `setup-archsmith`, choose the semantic-version bump, and write a concise release-note summary.

Documentation, tests, CI maintenance, and other changes with no user-visible release impact do not require a
changeset. Maintainers consume pending changesets with `npm run release:version` when preparing a release.
