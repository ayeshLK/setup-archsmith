import {mkdir, mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {assertNpmAvailable, createInstallDirectory, installAndVerify, type Execute} from '../src/install.js';

const createdDirectories: string[] = [];

afterEach(async () => {
  const {rm} = await import('node:fs/promises');
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, {recursive: true, force: true})));
});

describe('createInstallDirectory', () => {
  it('creates an isolated directory under RUNNER_TEMP', async () => {
    const runnerTemp = await mkdtemp(path.join(tmpdir(), 'setup-archsmith-test-'));
    createdDirectories.push(runnerTemp);
    const directory = await createInstallDirectory({RUNNER_TEMP: runnerTemp});
    expect(path.dirname(directory)).toBe(runnerTemp);
    expect(path.basename(directory)).toMatch(/^setup-archsmith-/);
  });
});

describe('assertNpmAvailable', () => {
  it('fails when npm cannot execute', async () => {
    const execute: Execute = async () => ({exitCode: 1, stdout: '', stderr: ''});
    await expect(assertNpmAvailable('/usr/bin/npm', execute)).rejects.toThrow(/could not be executed/i);
  });
});

describe('installAndVerify', () => {
  it('verifies package metadata and the generated executable', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'setup-archsmith-install-'));
    createdDirectories.push(directory);
    const packageDirectory = path.join(directory, 'node_modules', '@archsmith', 'cli');
    const binDirectory = path.join(directory, 'node_modules', '.bin');
    await mkdir(packageDirectory, {recursive: true});
    await mkdir(binDirectory, {recursive: true});
    await writeFile(path.join(packageDirectory, 'package.json'), JSON.stringify({version: '0.5.1'}));
    await writeFile(path.join(binDirectory, 'archsmith'), '#!/bin/sh\n');

    const calls: readonly string[][] = [];
    const mutableCalls = calls as string[][];
    const execute: Execute = async (_command, args) => {
      mutableCalls.push([...args]);
      return {exitCode: 0, stdout: args[0] === '--version' ? '0.5.1\n' : '', stderr: ''};
    };

    const result = await installAndVerify('/usr/bin/npm', '0.5.1', directory, 'linux', execute);
    expect(result).toEqual({binDirectory, cliVersionOutput: '0.5.1'});
    expect(calls[0]).toContain('@archsmith/cli@0.5.1');
    expect(await readFile(path.join(packageDirectory, 'package.json'), 'utf8')).toContain('0.5.1');
  });
});
