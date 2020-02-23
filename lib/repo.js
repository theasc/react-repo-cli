const CLI = require('clui');
const fs = require('fs');
const git = require('simple-git/promise')();
const Spinner = CLI.Spinner;
const touch = require("touch");
const _ = require('lodash');
const command = require('./command');
const inquirer = require('./inquirer');
const gh = require('./github');
const chalk = require('chalk');
const files = require('./files');
const github = require('./github');

module.exports = {
  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

    const data = {
      name: answers.name,
      description: answers.description,
      private: (answers.visibility === 'private')
    };

    const status = new Spinner('Creating remote repository...');
    status.start();

    try {
      const response = await github.repos.createForAuthenticatedUser(data);
      return response.data.ssh_url;
    } finally {
      status.stop();
    }
  },

  createGitignore: async () => {
    const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);

      if (answers.ignore.length) {
        fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) );
      } else {
        touch( '.gitignore' );
      }
    } else {
      touch('.gitignore');
    }
  },
  setupRepo: async (url) => {
    const status = new Spinner('Initializing local repository and pushing to remote...');
    status.start();

    try {
      git.init()
        .then(git.add('.gitignore'))
        .then(git.add('./*'))
        .then(git.commit('Initial commit'))
        .then(git.addRemote('origin', url))
        .then(git.push('origin', 'master'));
    } finally {
      status.stop();
    }
  },
  getGithubToken: async () => {
    // Fetch token from config store
    let token = github.getStoredGithubToken();
    if(token) {
      return token;
    }
  
    // No token found, use credentials to access GitHub account
    token = await github.getPersonalAccesToken();
  
    return token;
  },
  checkExistingRepo: () => {
    if (files.directoryExists('.git')) {
        console.log(chalk.red('Already a Git repository!'));
        command.stopProcess();
      }
  },
  generateRepository: async () => {
    try {
      module.exports.checkExistingRepo();
      // Retrieve & Set Authentication Token
      const token = await module.exports.getGithubToken();
      github.githubAuth(token);
  
      // Create remote repository
      const url = await module.exports.createRemoteRepo();
  
      // Create .gitignore file
      await module.exports.createGitignore();
  
      // Set up local repository and push to remote
      await module.exports.setupRepo(url);
  
      console.log(chalk.green('All done!'));
    } catch(err) {
        if (err) {
          switch (err.status) {
            case 401:
              console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
              break;
            case 422:
              console.log(chalk.red('There is already a remote repository or token with the same name'));
              break;
            default:
              console.log(chalk.red(err));
          }
        }
    }
  },
};
