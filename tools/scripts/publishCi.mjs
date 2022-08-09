
/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import { readCachedProjectGraph } from '@nrwl/devkit';
import { execSync } from 'child_process';
import chalk from 'chalk';

function invariant(condition, message) {
    if (!condition) {
        console.error(chalk.bold.red(message));
        process.exit(1);
    }
}




// Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, tag = 'next'] = process.argv;
const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
    project,
    `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
    outputPath,
    `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
);

process.chdir(outputPath);

// Execute "npm publish" to publish
try {
    execSync(`npm publish --access public --tag ${tag}`);
    console.log(chalk.bold.green(`Published ${name}@${tag} to npm.`));
} catch (e) {
    if (e.message.includes('You cannot publish over the previously published versions')) {
        console.error(chalk.bold.red(`You cannot publish over the previously published versions of "${name}".`));
    }
    else {
        process.exit(1)
    }
}

