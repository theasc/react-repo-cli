const CLI = require('clui');
const inquirer = require('./inquirer');
const { REACTNATIVE } = require('./contants');
const Spinner = CLI.Spinner;
const command = require('./command');
const chalk = require('chalk');

module.exports = {
    inquireProjectToGenerate: async () => {
        const answer = await inquirer.askChooseGenerate();
        return answer.project;
    },
    generateReactNativeProject: async () => {
        const projectName = await inquirer.askProjectName();
        const status = new Spinner('Creating your project...');
        try {
            status.start();
            await command.executeCommand(`npx react-native init ${projectName.name}`);
            status.stop();
            const choiceRepo = await inquirer.askGenerateRepository();
            if(choiceRepo.choice === 'no'){
                command.stopProcess();
            }
            command.changeCurrentDir(`./${projectName.name}`);
            return projectName.name;
        } catch(err) {
            status.stop();
            console.log(chalk.red('An error occured during project creation:', err)); 
        }
    },
    generateChosenProject: async (project) => {
        if(project === REACTNATIVE){
            return await module.exports.generateReactNativeProject();
        }
    },
}