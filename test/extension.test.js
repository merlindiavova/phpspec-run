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

suite("phpspec run Test Suite", function() {
    setup(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('phpspec-run').update('commandSuffix', null)
        await vscode.workspace.getConfiguration('phpspec-run').update('phpspecBinary', null)
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.enable", false)
    })

    teardown(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('phpspec-run').update('commandSuffix', null)
        await vscode.workspace.getConfiguration('phpspec-run').update('phpspecBinary', null)
        await vscode.workspace.getConfiguration("phpspec-run").update("ssh.enable", false)
    })

    test("it can detect the given filename", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().file,
                path.join(vscode.workspace.rootPath, '/spec/SampleSpec.php')
            );
        });
    });

    test("it can run the given spec (class)", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.ok(extension.getGlobalCommandInstance().lineNumber === undefined);
        });
    })

    test("it can run the given spec regardless of cursor position", async () => {
        let lineNumber = 14
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(lineNumber, 0, lineNumber, 0) });
        await vscode.commands.executeCommand('phpspec-run.spec');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run ') + path.join(vscode.workspace.rootPath, '/spec/SampleSpec.php')
            );
        });
    })

    test("it can run the given line", async () => {
        let lineNumber = 14
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(lineNumber, 0, lineNumber, 0) });
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().lineNumber,
                lineNumber
            );
        });
    })

    test("it can generate the binary path", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec')
            );
        });
    });

    test("it can generate the binary path within a subfolder", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'subfolder', 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                path.join(vscode.workspace.rootPath, '/subfolder/vendor/bin/phpspec')
            );
        });
    });

    test("test is can generate path to config files", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'subfolder', 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('phpspec-run.here');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ` --config ${path.join(vscode.workspace.rootPath, '/subfolder/phpspec.yml')}`
            );
        });
    });

    test("Check full command", async () => {
        let lineNumber = 14
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(lineNumber, 0, lineNumber, 0) });
        await vscode.commands.executeCommand('phpspec-run.here');
        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run ') + path.join(vscode.workspace.rootPath, '/spec/SampleSpec.php') + ":" + lineNumber
            );
        });
    });

    test("it can run the previous command", async () => {
        let lineNumber = 14
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'AnotherSampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(lineNumber, 0, lineNumber, 0) });
        await vscode.commands.executeCommand('phpspec-run.previous');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run ') + path.join(vscode.workspace.rootPath, '/spec/SampleSpec.php') + ":" + lineNumber
            );
        });
    });

    test("it can run the entire spec suite", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('phpspec-run.suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run')
            );
        });
    });

    test("it can run the given spec directory", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'MoreSamples', 'NestedSampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('phpspec-run.directory')
        let expectedPath = path.join(vscode.workspace.rootPath, 'spec', 'MoreSamples')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run') + ' ' + expectedPath
            );
        });
    });

    test("it uses the given command suffix config", async () => {
        await vscode.workspace.getConfiguration('phpspec-run').update('commandSuffix', '--format=dot');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(14, 0, 14, 0) });
        await vscode.commands.executeCommand('phpspec-run.suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpspec run') + ' --format=dot'
            );
        });
    });

    test("it uses the given phpspec binary config", async () => {
        await vscode.workspace.getConfiguration('phpspec-run').update('phpspecBinary', 'vendor/foo/bar');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'spec', 'SampleSpec.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(14, 0, 14, 0) });
        await vscode.commands.executeCommand('phpspec-run.suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "vendor/foo/bar run"
            );
        });
    });

})