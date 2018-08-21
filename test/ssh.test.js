/* global suite, test */
const assert = require('assert')
const vscode = require('vscode')
const path = require('path')
const extension = require('../src/extension')
const waitToAssertInSeconds = 5

// This is a little helper function to promisify setTimeout, so we can "await" setTimeout.
function timeout(seconds, callback) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback()
            resolve()
        }, seconds * waitToAssertInSeconds)
    })
}

suite("phpspec run SSH Test Suite", function() {
    setup(async () => {
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.enable", true);
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.port", "2222");

        const paths = {};
        paths[path.join(vscode.workspace.rootPath)] = "/some/remote/path";
        paths["/some/other_local/path"] = "/some/other_remote/path";
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.paths", paths);
    })

    teardown(async () => {
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.user", "auser");
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.host", "ahost");
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.port", "2222");
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.binary", null);
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.paths", {});
    })

    test("Commands are not wrapped when SSH is disabled", async function () {
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.enable", false);

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(16, 0, 16, 0) });
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run ') + path.join(vscode.workspace.rootPath, '/spec/SampleSpec.php') + ":" + 14
        );
    });

    test("The correct SSH command is run when triggering phpspec run", async function () {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(11, 0, 11, 0) });
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpspec run /some/remote/path/spec/SampleSpec.php:9"'
        );
    });

    test("Can use a custom ssh binary", async function () {
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.binary", "putty -ssh");

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(16, 0, 16, 0) });
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => { })

        assert.equal(
            extension.getGlobalCommandInstance().output,
            'putty -ssh -tt -p2222 auser@ahost "/some/remote/path/vendor/bin/phpspec run /some/remote/path/spec/SampleSpec.php:14"'
        );
    });

})