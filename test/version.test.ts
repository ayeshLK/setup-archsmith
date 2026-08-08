import {describe, expect, it} from 'vitest';
import {parseResolvedVersion, validateVersionSpec} from '../src/version.js';

describe('validateVersionSpec', () => {
  it.each(['0.5.1', '0.5.x', '^0.5.0', '>=0.5.0 <1.0.0'])('accepts npm semver input %s', (input) => {
    expect(validateVersionSpec(input)).toEqual({value: input, kind: 'range'});
  });

  it.each(['latest', 'next', 'release-2026'])('accepts dist-tag %s', (input) => {
    expect(validateVersionSpec(input)).toEqual({value: input, kind: 'tag'});
  });

  it.each(['', 'file:../cli', 'https://example.com/cli.tgz', 'latest\n--json', '../latest'])('rejects %j', (input) => {
    expect(() => validateVersionSpec(input)).toThrow(/version/i);
  });
});

describe('parseResolvedVersion', () => {
  it('returns an exact version for a dist-tag', () => {
    expect(parseResolvedVersion('"0.5.1"', validateVersionSpec('latest'))).toBe('0.5.1');
  });

  it('selects the greatest version satisfying a range', () => {
    const response = JSON.stringify(['0.5.0', '0.5.1', '0.6.0']);
    expect(parseResolvedVersion(response, validateVersionSpec('0.5.x'))).toBe('0.5.1');
  });

  it('rejects malformed registry output', () => {
    expect(() => parseResolvedVersion('not json', validateVersionSpec('latest'))).toThrow(/invalid response/i);
  });
});
