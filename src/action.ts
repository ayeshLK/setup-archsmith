import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import {assertNpmAvailable, createInstallDirectory, installAndVerify, type Execute} from './install.js';
import {assertSupportedNode} from './prerequisites.js';
import {parseResolvedVersion, validateVersionSpec} from './version.js';

type CoreApi = Pick<typeof core, 'addPath' | 'getInput' | 'info' | 'setFailed' | 'setOutput'>;

export type ActionDependencies = Readonly<{
  core: CoreApi;
  execute: Execute;
  which: (tool: string, check?: boolean) => Promise<string>;
  environment: NodeJS.ProcessEnv;
  platform: NodeJS.Platform;
}>;

const execute: Execute = async (command, args, options) => {
  const result = await exec.getExecOutput(command, [...args], {
    silent: options?.silent ?? false,
    ignoreReturnCode: true,
  });
  return {exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr};
};

export const defaultDependencies: ActionDependencies = {
  core,
  execute,
  which: io.which,
  environment: process.env,
  platform: process.platform,
};

export async function runAction(dependencies: ActionDependencies): Promise<void> {
  const requested = dependencies.core.getInput('version') || 'latest';
  const spec = validateVersionSpec(requested);

  let nodePath: string;
  try {
    nodePath = await dependencies.which('node', true);
  } catch {
    throw new Error('Setup ArchSmith requires Node.js 20 or newer on PATH. Add actions/setup-node before this action.');
  }
  const node = await dependencies.execute(nodePath, ['--version'], {silent: true});
  if (node.exitCode !== 0) {
    throw new Error('Node.js is installed but could not be executed. Add actions/setup-node before Setup ArchSmith.');
  }
  assertSupportedNode(node.stdout.trim().replace(/^v/u, ''));

  let npmPath: string;
  try {
    npmPath = await dependencies.which('npm', true);
  } catch {
    throw new Error('Setup ArchSmith requires npm. Install Node.js with npm before running this action.');
  }
  await assertNpmAvailable(npmPath, dependencies.execute);

  dependencies.core.info(`Resolving @archsmith/cli@${spec.value}`);
  const resolution = await dependencies.execute(
    npmPath,
    ['view', `@archsmith/cli@${spec.value}`, 'version', '--json'],
    {silent: true},
  );
  if (resolution.exitCode !== 0) {
    throw new Error(
      `Could not resolve @archsmith/cli@${spec.value}. Check the version input and public npm registry access.`,
    );
  }
  const exactVersion = parseResolvedVersion(resolution.stdout, spec);

  dependencies.core.info(`Installing @archsmith/cli@${exactVersion}`);
  const installDirectory = await createInstallDirectory(dependencies.environment);
  const verified = await installAndVerify(
    npmPath,
    exactVersion,
    installDirectory,
    dependencies.platform,
    dependencies.execute,
  );

  dependencies.core.addPath(verified.binDirectory);
  dependencies.core.setOutput('version', exactVersion);
  dependencies.core.info(`Installed ArchSmith CLI ${exactVersion}`);
  if (verified.cliVersionOutput) {
    dependencies.core.info(`archsmith --version: ${verified.cliVersionOutput}`);
  }
}

export async function run(dependencies: ActionDependencies = defaultDependencies): Promise<void> {
  try {
    await runAction(dependencies);
  } catch (error) {
    dependencies.core.setFailed(error instanceof Error ? error.message : 'Setup ArchSmith failed unexpectedly.');
  }
}
