import semver from 'semver';

export function assertSupportedNode(nodeVersion: string): void {
  if (!semver.satisfies(nodeVersion, '>=20.0.0')) {
    throw new Error(
      `Setup ArchSmith requires Node.js 20 or newer; the current runner is using Node.js ${nodeVersion}. ` +
        'Add actions/setup-node before this action.',
    );
  }
}
