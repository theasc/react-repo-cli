#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const repo = require('./lib/repo');
const projectGenerator = require('./lib/projectGenerator');
const { REPOSITORY } = require('./lib/contants');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('React Repo', { horizontalLayout: 'full' })
  )
);

(async () => {
    const project = await projectGenerator.inquireProjectToGenerate();
    if(project === REPOSITORY){
        repo.generateRepository();
    } 
    const projectName = await projectGenerator.generateChosenProject(project);
    await repo.generateRepository(`./${projectName}`);
})();

