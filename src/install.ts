import {access, mkdir, mkdtemp, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import semver from 'semver';

export type ExecResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

export type Execute = (
  command: string,
  args: readonly string[],
  options?: Readonly<{silent?: boolean}>,
) => Promise<ExecResult>;

export async function createInstallDirectory(environment: NodeJS.ProcessEnv): Promise<string> {
  const baseDirectory = environment.RUNNER_TEMP?.trim() || tmpdir();
  await mkdir(baseDirectory, {recursive: true});
  return mkdtemp(path.join(baseDirectory, 'setup-archsmith-'));
}

export async function assertNpmAvailable(npmPath: string, execute: Execute): Promise<void> {
  const result = await execute(npmPath, ['--version'], {silent: true});
  if (result.exitCode !== 0) {
    throw new Error('npm is installed but could not be executed. Ensure npm is available before running Setup ArchSmith.');
  }
}

export async function installAndVerify(
  npmPath: string,
  exactVersion: string,
  installDirectory: string,
  platform: NodeJS.Platform,
  execute: Execute,
): Promise<{binDirectory: string; cliVersionOutput: string}> {
  const packageSpec = `@archsmith/cli@${exactVersion}`;
  const install = await execute(
    npmPath,
    [
      'install',
      '--prefix',
      installDirectory,
      '--no-save',
      '--no-audit',
      '--no-fund',
      '--loglevel',
      'error',
      packageSpec,
    ],
    {silent: true},
  );

  if (install.exitCode !== 0) {
    throw new Error(
      `npm failed to install ${packageSpec}. Check npm registry access and whether the requested version is installable.`,
    );
  }

  const packageJsonPath = path.join(installDirectory, 'node_modules', '@archsmith', 'cli', 'package.json');
  let installedVersion: unknown;
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {version?: unknown};
    installedVersion = packageJson.version;
  } catch {
    throw new Error('ArchSmith was installed, but its package metadata could not be verified.');
  }

  if (typeof installedVersion !== 'string' || !semver.eq(installedVersion, exactVersion)) {
    throw new Error(`Expected ArchSmith ${exactVersion}, but npm installed an unexpected package version.`);
  }

  const binDirectory = path.join(installDirectory, 'node_modules', '.bin');
  const executable = path.join(binDirectory, platform === 'win32' ? 'archsmith.cmd' : 'archsmith');

  try {
    await access(executable);
  } catch {
    throw new Error('ArchSmith was installed, but the archsmith executable was not created.');
  }

  const verification = await execute(executable, ['--version'], {silent: true});
  if (verification.exitCode !== 0) {
    throw new Error('ArchSmith was installed, but running archsmith --version failed.');
  }

  return {binDirectory, cliVersionOutput: verification.stdout.trim()};
}
