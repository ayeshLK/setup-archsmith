# Security Policy

## Supported versions

Setup ArchSmith is currently released through the moving `v0` major tag. Security fixes are applied to the latest
published `v0` release.

| Version | Supported |
| --- | --- |
| Latest published `v0` release | Yes |
| Older releases, tags, and commits | No |

Users who pin the action to a full commit SHA should update to the commit used by the latest published release when a
security fix is announced.

## Reporting a vulnerability

Do not report suspected vulnerabilities in a public issue, pull request, discussion, or workflow log.

[Report the vulnerability privately through GitHub Security Advisories](https://github.com/ayeshLK/setup-archsmith/security/advisories/new).
Include, when possible:

- the affected action and ArchSmith CLI versions;
- the runner operating system and relevant workflow configuration;
- steps to reproduce the issue or a minimal proof of concept;
- the potential impact; and
- any mitigations you have already identified.

Remove credentials, npm tokens, private registry URLs, and other unrelated secrets from the report. The maintainer
will coordinate investigation, remediation, and disclosure through the private advisory. Please allow time for a
fix to be prepared before sharing vulnerability details publicly.
