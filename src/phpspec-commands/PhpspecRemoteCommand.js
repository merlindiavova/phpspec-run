const vscode = require('vscode');
const PhpspecCommand = require('./PhpspecCommand');
const path = require('path');

module.exports = class PhpspecRemoteCommand extends PhpspecCommand {
    constructor(options) {
        super(options);

        this.config = vscode.workspace.getConfiguration("phpspec-run");
    }

    get file() {
        return this.remapLocalPath(super.file);
    }

    get binary() {
        return this.remapLocalPath(super.binary)
    }

    get output() {
        return this.wrapCommand(super.output);
    }

    get configuration() {
        return this.subDirectory
            ? ' --config ' + this.remapLocalPath(this._normalizePath(path.join(this.subDirectory, 'phpspec.yml')))
            : '';
    }

    get paths() {
        return this.config.get("ssh.paths");
    }

    get sshBinary() {
        if (this.config.get("ssh.binary")) {
            return this.config.get("ssh.binary");
        }

        return "ssh";
    }

    remapLocalPath(actualPath) {
        for (const [localPath, remotePath] of Object.entries(this.paths)) {
            if (actualPath.startsWith(localPath)) {
                return actualPath.replace(localPath, remotePath);
            }
        }

        return actualPath;
    }

    wrapCommand(command) {
        const user = this.config.get("ssh.user");
        const port = this.config.get("ssh.port");
        const host = this.config.get("ssh.host");
        let options = this.config.get("ssh.options");

        if (!options)
            options = `-tt -p${port}`;

        return `${this.sshBinary} ${options} ${user}@${host} "${command}"`;
    }
}
