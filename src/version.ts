import semver from 'semver';

export type VersionSpec = Readonly<{
  value: string;
  kind: 'range' | 'tag';
}>;

const DIST_TAG_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;
const MAX_SPEC_LENGTH = 128;

export function validateVersionSpec(raw: string): VersionSpec {
  const value = raw.trim();

  if (value.length === 0) {
    throw new Error('The version input must not be empty. Use an exact version, npm range, or dist-tag such as latest.');
  }

  if (value.length > MAX_SPEC_LENGTH || /[\r\n\0]/u.test(value)) {
    throw new Error('The version input is not a valid npm version, range, or dist-tag.');
  }

  if (semver.validRange(value) !== null) {
    return {value, kind: 'range'};
  }

  if (DIST_TAG_PATTERN.test(value)) {
    return {value, kind: 'tag'};
  }

  throw new Error(`Invalid ArchSmith version input "${value}". Use an exact version, npm range, or dist-tag such as latest.`);
}

export function parseResolvedVersion(stdout: string, spec: VersionSpec): string {
  let response: unknown;

  try {
    response = JSON.parse(stdout);
  } catch {
    throw new Error(`npm returned an invalid response while resolving @archsmith/cli@${spec.value}.`);
  }

  const versions = (Array.isArray(response) ? response : [response]).filter(
    (candidate): candidate is string => typeof candidate === 'string' && semver.valid(candidate) !== null,
  );

  if (versions.length === 0) {
    throw new Error(`npm did not return a published version for @archsmith/cli@${spec.value}.`);
  }

  if (spec.kind === 'range') {
    const exact = semver.maxSatisfying(versions, spec.value);
    if (exact === null) {
      throw new Error(`npm did not return a version satisfying @archsmith/cli@${spec.value}.`);
    }
    return exact;
  }

  if (versions.length !== 1) {
    throw new Error(`npm returned an ambiguous response for the ${spec.value} dist-tag.`);
  }

  return versions[0]!;
}
