#!/usr/bin/env node
/**
 *
 * Copied from https://github.com/traveloka/javascript/blob/master/scripts/publish-atom-linter
 *
 * HACK: APM can only be published via github repository. Because we use monorepo
 * approach, we can't run `apm publish` inside `atom-import-sort` directory.
 * The workaround for this problem is cloning placeholder repository for atom-import-sort,
 * copying all files inside atom-import-sort directory, commit those with version tag
 * specified in lerna.json, then force-push to repository then run `apm publish`
 */
const path = require('path');
const exec = require('child_process').execSync;
const version = require('../lerna.json').version;

const insidePlaceholderRepo = {
  cwd: path.join(process.cwd(), 'atom-import-sort-placeholder'),
};

exec('git clone git@github.com:renke/atom-import-sort.git atom-import-sort-placeholder');
exec('rm -rf "atom-import-sort-placeholder/.*" 2> /dev/null');
exec('cp -R packages/atom-import-sort/* atom-import-sort-placeholder/');
exec('cd atom-import-sort-placeholder');
exec('git add -A', insidePlaceholderRepo);
exec(`git commit -m "v${version}"`, insidePlaceholderRepo);
exec(`git tag "v${version}"`, insidePlaceholderRepo);
exec('git push origin master --follow-tags --force', insidePlaceholderRepo);
exec('git push origin master --tags --force', insidePlaceholderRepo);
exec(`apm publish --tag "v${version}"`, insidePlaceholderRepo);
exec('rm -rf atom-import-sort-placeholder');
