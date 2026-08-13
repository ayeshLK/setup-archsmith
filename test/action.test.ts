import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {run, runAction, type ActionDependencies} from '../src/action.js';
import type {Execute} from '../src/install.js';
import {NPM_REGISTRY} from '../src/registry.js';

const createdDirectories: string[] = [];

afterEach(async () => {
  const {rm} = await import('node:fs/promises');
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, {recursive: true, force: true})));
});

function makeCore(version = 'latest') {
  return {
    getInput: vi.fn(() => version),
    setOutput: vi.fn(),
    addPath: vi.fn(),
    info: vi.fn(),
    setFailed: vi.fn(),
  };
}

describe('runAction', () => {
  it('publishes the exact installed version and executable path', async () => {
    const runnerTemp = await mkdtemp(path.join(tmpdir(), 'setup-archsmith-action-'));
    createdDirectories.push(runnerTemp);
    const core = makeCore('0.5.x');

    const execute: Execute = async (command, args) => {
      if (command.endsWith('/node')) return {exitCode: 0, stdout: 'v20.19.0\n', stderr: ''};
      if (command.endsWith('/npm') && args[0] === '--version') {
        return {exitCode: 0, stdout: '10.9.0\n', stderr: ''};
      }
      if (args[0] === 'view') return {exitCode: 0, stdout: '["0.5.0","0.5.1"]', stderr: ''};
      if (args[0] === 'install') {
        const prefix = args[args.indexOf('--prefix') + 1]!;
        const packageDirectory = path.join(prefix, 'node_modules', '@archsmith', 'cli');
        const binDirectory = path.join(prefix, 'node_modules', '.bin');
        await mkdir(packageDirectory, {recursive: true});
        await mkdir(binDirectory, {recursive: true});
        await writeFile(path.join(packageDirectory, 'package.json'), JSON.stringify({version: '0.5.1'}));
        await writeFile(path.join(binDirectory, 'archsmith'), '#!/bin/sh\n');
        return {exitCode: 0, stdout: '', stderr: ''};
      }
      return {exitCode: 0, stdout: '0.5.1\n', stderr: ''};
    };

    const dependencies: ActionDependencies = {
      core,
      execute,
      which: vi.fn(async (tool) => `/usr/bin/${tool}`),
      environment: {RUNNER_TEMP: runnerTemp},
      platform: 'linux',
    };

    await runAction(dependencies);
    expect(core.setOutput).toHaveBeenCalledWith('version', '0.5.1');
    expect(core.addPath).toHaveBeenCalledWith(expect.stringContaining(path.join('node_modules', '.bin')));
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it.each([
    ['0.5.1', '"0.5.1"'],
    ['0.5.x', '["0.5.0","0.5.1"]'],
    ['latest', '"0.5.1"'],
  ])('overrides repository registry configuration while resolving %s', async (version, response) => {
    const runnerTemp = await mkdtemp(path.join(tmpdir(), 'setup-archsmith-registry-'));
    createdDirectories.push(runnerTemp);
    await writeFile(
      path.join(runnerTemp, '.npmrc'),
      'registry=https://attacker.invalid/\n@archsmith:registry=https://attacker.invalid/\n',
    );
    const core = makeCore(version);
    const calls: string[][] = [];

    const execute: Execute = async (command, args) => {
      calls.push([...args]);
      if (command.endsWith('/node')) return {exitCode: 0, stdout: 'v20.19.0\n', stderr: ''};
      if (args[0] === '--version') return {exitCode: 0, stdout: '10.9.0\n', stderr: ''};
      if (args[0] === 'view') return {exitCode: 0, stdout: response, stderr: ''};
      if (args[0] === 'install') {
        const prefix = args[args.indexOf('--prefix') + 1]!;
        const packageDirectory = path.join(prefix, 'node_modules', '@archsmith', 'cli');
        const binDirectory = path.join(prefix, 'node_modules', '.bin');
        await mkdir(packageDirectory, {recursive: true});
        await mkdir(binDirectory, {recursive: true});
        await writeFile(path.join(packageDirectory, 'package.json'), JSON.stringify({version: '0.5.1'}));
        await writeFile(path.join(binDirectory, 'archsmith'), '#!/bin/sh\n');
        return {exitCode: 0, stdout: '', stderr: ''};
      }
      return {exitCode: 0, stdout: '0.5.1\n', stderr: ''};
    };

    await runAction({
      core,
      execute,
      which: vi.fn(async (tool) => `/usr/bin/${tool}`),
      environment: {RUNNER_TEMP: runnerTemp, NPM_CONFIG_REGISTRY: 'https://environment.invalid/'},
      platform: 'linux',
    });

    const registryArguments = [`--registry=${NPM_REGISTRY}`, `--@archsmith:registry=${NPM_REGISTRY}`];
    const resolution = calls.find((args) => args[0] === 'view');
    const installation = calls.find((args) => args[0] === 'install');
    expect(resolution).toEqual(expect.arrayContaining(registryArguments));
    expect(installation).toEqual(expect.arrayContaining(registryArguments));
    expect(core.setOutput).toHaveBeenCalledWith('version', '0.5.1');
  });

  it('reports a secret-safe resolution error', async () => {
    const core = makeCore('missing');
    const dependencies: ActionDependencies = {
      core,
      execute: vi.fn(async (command: string, args: readonly string[]) => ({
        exitCode: args[0] === 'view' ? 1 : 0,
        stdout: command.endsWith('/node') ? 'v20.0.0\n' : '',
        stderr: 'https://token@example.invalid/private detail',
      })),
      which: vi.fn(async (tool) => `/usr/bin/${tool}`),
      environment: {},
      platform: 'linux',
    };

    await run(dependencies);
    expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(/could not resolve/i));
    expect(core.setFailed.mock.calls[0]?.[0]).not.toContain('token');
  });

  it('checks the workflow Node.js version instead of the action runtime', async () => {
    const core = makeCore();
    const dependencies: ActionDependencies = {
      core,
      execute: vi.fn(async (command: string) => ({
        exitCode: 0,
        stdout: command.endsWith('/node') ? 'v18.20.0\n' : '10.9.0\n',
        stderr: '',
      })),
      which: vi.fn(async (tool) => `/usr/bin/${tool}`),
      environment: {},
      platform: 'linux',
    };

    await run(dependencies);
    expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(/Node\.js 20 or newer/i));
  });
});
