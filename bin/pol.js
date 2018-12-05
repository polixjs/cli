#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const log = require('../lib/log')({ debug: false });
const spawn = require('hexo-util/lib/spawn');
const pkg = require('../package.json');
const utils = require('../lib/utils');
const Promise = require('bluebird');
const p = require('path');
const polix = 'https://github.com/polixjs/template.git';

const argv = process.argv;
if(argv.length == 1 || (argv.length == 2 && argv[1][0] != '-')){
  console.log(`
Usage: pol <command>

Options:

  -v, --version  output the version number
  -h, --help     output usage information

Commands:

  init           init Polix Dev`);
}

program
  .version(pkg.version, '-v, --version')
  .usage('<command>');

program
  .command('init')
  .description('init Polix Dev')
  .action(async function (args) {
    const type = await inquirer.prompt({
      name: 'group',
      type: 'list',
      message: '选择模板类别',
      choices: ['simple - Simple polix app', 'orm - typeorm for polix', 'plugin - polix plugin boilerplate'],
      pageSize: 3
    });
    let branch = 'simple-branch';
    if (type.group.indexOf('orm -') > -1) {
      branch = 'master';
    } else if (type.group.indexOf('plugin -') > -1) {
      branch = 'plugin-branch';
    }
    let path = process.cwd();
    let name;
    name = utils.isType(utils.TYPE.String, args) ? args : 'polix-example';
    path = p.format({
      dir: path,
      base: name
    });
    log.info('Category: ', log.color.yellow(type.group));
    log.info(`Cloning Polix-starter to`, log.color.yellow(path));
    spawn('git', ['clone', '--recursive', '-b' , branch, polix, path], {
      stdio: 'inherit'
    }).catch(function () {
      log.warn('git clone failed. Copying data instead');
      return;
    }).then(function () {

      log.info('Install dependencies');

      return spawn('npm', ['i'], {
        cwd: path,
        stdio: 'inherit'
      });
    }).then(function () {
      return spawn('npm', ['i', 'polix', '--save'], {
        cwd: path,
        stdio: 'inherit'
      }).then(function(){
        log.info('Start dev with Polix!');
      }).catch(function (){
        log.warn('Failed to install dependencies. Please run \'yarn add polix\' manually!');
      });
    }).catch(function () {
      log.warn('Failed to install dependencies. Please run \'yarn install\' manually!');
    });
  });

program.parse(process.argv);
