
/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import { readCachedProjectGraph  } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  } 
}

// Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, version, tag = 'next', update ] = process.argv;

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
 `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);
let updatedVersion 
if (version === undefined) {
  try {
    const json = JSON.parse(readFileSync(`package.json`).toString());
    updatedVersion = getUpdatedVersion(update, json.version);
  } catch (e) {
    console.error(
      chalk.bold.red(`Error reading package.json file from library build output.`)
    );
  }
}

updatedVersion = updatedVersion || version;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d(-\w+\.\d+)?/;
invariant(
  updatedVersion && validVersion.test(updatedVersion),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${updatedVersion}.`
);


const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
);

process.chdir(outputPath);

// Updating the version in "package.json" before publishing
try {
  const json = JSON.parse(readFileSync(`package.json`).toString());
  json.version = updatedVersion;
  writeFileSync(`package.json`, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error reading package.json file from library build output.`)
  );
}

// Execute "npm publish" to publish
execSync(`npm publish --access public --tag ${tag}`);


const getUpdatedVersion = (update, version) => {
  validateUpdate(update);
  if (update === 'patch') {
    return version.split('.').map((v, i) => {
      if (i === 2) {
        return parseInt(v) + 1;
      }
      return v;
    }).join('.');
  }
  if (update === 'minor') {
    return version.split('.').map((v, i) => {
      if (i === 1) {
        return parseInt(v) + 1;
      }
      return v;
    }).join('.');
  }
  if (update === 'major') {
    return version.split('.').map((v, i) => {
      if (i === 0) {
        return parseInt(v) + 1;
      }
      return v;
    }).join('.');
  }
  return version;
}

const validateUpdate = (update) => {
  invariant(
    update === 'patch' || update === 'minor' || update === 'major',
    `Invalid update value, expected "patch", "minor" or "major", got ${update}.`
  );
}
