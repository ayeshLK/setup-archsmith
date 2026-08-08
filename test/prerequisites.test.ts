import {describe, expect, it} from 'vitest';
import {assertSupportedNode} from '../src/prerequisites.js';

describe('assertSupportedNode', () => {
  it.each(['20.0.0', '22.12.0', '24.1.0'])('accepts Node.js %s', (version) => {
    expect(() => assertSupportedNode(version)).not.toThrow();
  });

  it('explains how to fix an unsupported Node.js version', () => {
    expect(() => assertSupportedNode('18.20.0')).toThrow(/Node\.js 20 or newer.*actions\/setup-node/s);
  });
});
