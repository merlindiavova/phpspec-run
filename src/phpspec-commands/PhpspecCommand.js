const findUp = require('find-up');
const vscode = require('vscode');
const path = require('path');

module.exports = class PhpspecCommand {
    constructor(options) {
        this.runFullSuite = options !== undefined
            ? options.runFullSuite
            : false;

        this.runDirectory = options !== undefined
            ? options.runDirectory
            : false;

        this.runSpec = options !== undefined
            ? options.runSpec
            : false;

        this.lastOutput;
    }

    get output() {
        if (this.lastOutput) {
            return this.lastOutput;
        }

        this.lastOutput = this.buildOutput;

        return this.lastOutput;
    }

    get buildOutput() {
        if (this.runFullSuite === true) {
            return `${this.binary} run${this.suffix}`
        }

        if (this.runSpec === true) {
            return `${this.binary} run ${this.file}${this.configuration}${this.suffix}`
        }

        if (this.runDirectory === true) {
            return `${this.binary} run ${this.dir}${this.configuration}${this.suffix}`
        }

        return `${this.binary} run ${this.file}${this.filter}${this.configuration}${this.suffix}`;
    }

    get dir() {
        return path.dirname(
            this._normalizePath(
                vscode.window.activeTextEditor.document.fileName
            )
        )
    }

    get file() {
        return this._normalizePath(
            vscode.window.activeTextEditor.document.fileName
        )
    }

    get filter() {
        return this.lineNumber ? `:${this.lineNumber}` : '';
    }

    get configuration() {
        return this.subDirectory
            ? ` --config ${this._normalizePath(path.join(this.subDirectory, 'phpspec.yml'))}`
            : '';
    }

    get suffix() {
        let suffix = vscode.workspace.getConfiguration('phpspec-run').get('commandSuffix');

        return suffix ? ' ' + suffix : ''; // Add a space before the suffix.
    }

    get binary() {
        if (vscode.workspace.getConfiguration('phpspec-run').get('phpspecBinary')) {
            return vscode.workspace.getConfiguration('phpspec-run').get('phpspecBinary')
        }

        return this.subDirectory
            ? this._normalizePath(path.join(this.subDirectory, 'vendor', 'bin', 'phpspec'))
            : this._normalizePath(path.join(vscode.workspace.rootPath, 'vendor', 'bin', 'phpspec'));
    }

    get subDirectory() {
        // find the closest phpspec.yml file in the project (for projects with multiple "vendor/bin/phpspec"s).
        let phpspecDotXml = findUp.sync(['phpspec.yml', 'phpspec.yml.dist'], { cwd: vscode.window.activeTextEditor.document.fileName });

        return path.dirname(phpspecDotXml) !== vscode.workspace.rootPath
            ? path.dirname(phpspecDotXml)
            : null;
    }

    get lineNumber() {
        let line = vscode.window.activeTextEditor.selection.active.line;
        let lineNumber;

        while (line > 0) {
            const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
            const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);
            if (match) {
                lineNumber = line + 1;
                break;
            }
            line = line - 1;
        }

        return lineNumber;
    }

    _normalizePath(path) {
        return path
            .replace(/\\/g, '/') // Convert backslashes from windows paths to forward slashes, otherwise the shell will ignore them.
            .replace(/ /g, '\\ '); // Escape spaces.
    }
}
