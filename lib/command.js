const { exec } = require('child_process');
const CLI = require('clui');
const fs = require('fs');
const chalk = require('chalk');
const Spinner = CLI.Spinner;
const touch = require("touch");
module.exports = {
    executeCommand: async (command) => {
        return new Promise((resolve, reject) => {
            const status = new Spinner('Installing react native...');
            status.start();
                const child = exec(command,
                function (error, stdout, stderr) {
                    status.stop();
                    if (error !== null) {
                         console.log('exec error: ' + error);
                         reject();
                    }
                    resolve();
                });
            
        })
    
    }
};