const vscode = require('vscode');
const PhpspecCommand = require('./phpspec-commands/PhpspecCommand');
const PhpspecRemoteCommand = require('./phpspec-commands/PhpspecRemoteCommand');

var globalCommand;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('phpspec-run.here', async () => {
        const command = vscode.workspace.getConfiguration("phpspec-run").get("ssh.enable")
            ? new PhpspecRemoteCommand
            : new PhpspecCommand;

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('phpspec-run.spec', async () => {
        const command = vscode.workspace.getConfiguration("phpspec-run").get("ssh.enable")
            ? new PhpspecRemoteCommand({ runSpec: true })
            : new PhpspecCommand({ runSpec: true });

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('phpspec-run.suite', async () => {
        const command = vscode.workspace.getConfiguration("phpspec-run").get("ssh.enable")
            ? new PhpspecRemoteCommand({ runFullSuite: true })
            : new PhpspecCommand({ runFullSuite: true });

        await runCommand(command);
    }));


    disposables.push(vscode.commands.registerCommand('phpspec-run.directory', async () => {
        const command = vscode.workspace.getConfiguration("phpspec-run").get("ssh.enable")
            ? new PhpspecRemoteCommand({ runDirectory: true })
            : new PhpspecCommand({ runDirectory: true });

        await runCommand(command);
    }));

    disposables.push(vscode.commands.registerCommand('phpspec-run.previous', async () => {
        await runPreviousCommand();
    }));

    disposables.push(vscode.workspace.registerTaskProvider('phpspec', {
        provideTasks: () => {
            return [new vscode.Task(
                { type: "phpspec", task: "run" },
                "run",
                'phpspec',
                new vscode.ShellExecution(globalCommand.output),
                '$phpspec'
            )];
        }
    }));

    context.subscriptions.push(disposables);
}

async function runCommand(command) {
    setGlobalCommandInstance(command);

    vscode.window.activeTextEditor
        || vscode.window.showErrorMessage('phpspec run: open a file to run this command');

    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpspec: run');
}

async function runPreviousCommand() {
    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'phpspec: run');
}

function setGlobalCommandInstance(commandInstance) {
    // Store this object globally for the provideTasks, "run-previous", and for tests to assert against.
    globalCommand = commandInstance;
}

// This method is exposed for testing purposes.
module.exports.getGlobalCommandInstance = function () {
    return globalCommand;
}