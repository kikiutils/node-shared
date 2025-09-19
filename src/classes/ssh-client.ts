import { createConsola } from 'consola';
import type { ConsolaInstance } from 'consola';
import { NodeSSH } from 'node-ssh';
import type {
    Config,
    SSHExecCommandOptions,
    SSHGetPutDirectoryOptions,
    SSHPutFilesOptions,
} from 'node-ssh';
import type {
    SFTPWrapper,
    TransferOptions,
} from 'ssh2';

import type { PathLike } from './path';

const loggerLevelStringToConsolaLogLevelMap = {
    debug: 4,
    error: 0,
    fatal: 0,
    info: 3,
    normal: 2,
    silent: -999,
    trace: 5,
    verbose: 999,
    warn: 1,
} as const;

export class SshClient {
    readonly #connectConfig: Config;
    readonly #logger: ConsolaInstance;

    #nodeSsh: NodeSSH;

    constructor(host: string, username: string, password: string, port: number = 22, connectConfig?: Config) {
        this.#connectConfig = {
            ...connectConfig,
            host,
            password,
            port,
            username,
        };

        this.#logger = createConsola();
        this.#nodeSsh = new NodeSSH();
        if (process.env.NODE_ENV === 'production') this.setLoggerLevel('error');
    }

    get nodeSsh() {
        return this.#nodeSsh;
    }

    async connect() {
        try {
            this.#nodeSsh = await this.#nodeSsh.connect(this.#connectConfig);
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    disconnect() {
        try {
            this.#nodeSsh.dispose();
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    execCommand(command: string, options?: SSHExecCommandOptions) {
        return this.#nodeSsh.execCommand(command, options).catch(() => {});
    }

    execCommandWithIo(command: string, options?: SSHExecCommandOptions) {
        return this.execCommand(
            command,
            {
                ...options,
                onStderr: (data) => process.stderr.write(data.toString()),
                onStdout: (data) => process.stdout.write(data.toString()),
            },
        );
    }

    getDir = this.getDirectory;

    async getDirectory(localDirectory: PathLike, remoteDirectory: PathLike, options?: SSHGetPutDirectoryOptions) {
        try {
            return await this.#nodeSsh.getDirectory(localDirectory.toString(), remoteDirectory.toString(), options);
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    async getFile(
        localFile: PathLike,
        remoteFile: PathLike,
        givenSftp?: null | SFTPWrapper,
        transferOptions?: null | TransferOptions,
    ) {
        try {
            await this.#nodeSsh.getFile(localFile.toString(), remoteFile.toString(), givenSftp, transferOptions);
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    isConnected() {
        return this.#nodeSsh.isConnected();
    }

    async mkdir(path: PathLike) {
        try {
            await this.#nodeSsh.mkdir(path.toString());
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    putDir = this.putDirectory;

    async putDirectory(localDirectory: PathLike, remoteDirectory: PathLike, options?: SSHGetPutDirectoryOptions) {
        try {
            return await this.#nodeSsh.putDirectory(localDirectory.toString(), remoteDirectory.toString(), options);
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    async putFile(
        localFile: PathLike,
        remoteFile: PathLike,
        givenSftp?: null | SFTPWrapper,
        transferOptions?: null | TransferOptions,
    ) {
        try {
            await this.#nodeSsh.putFile(localFile.toString(), remoteFile.toString(), givenSftp, transferOptions);
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    async putFiles(files: { local: PathLike; remote: PathLike }[], options?: SSHPutFilesOptions) {
        try {
            const convertedFiles = files.map(({ local, remote }) => ({
                local: local.toString(),
                remote: remote.toString(),
            }));

            await this.#nodeSsh.putFiles(convertedFiles, options);
            return true;
        } catch (error) {
            this.#logger.error(error);
            return false;
        }
    }

    setLoggerLevel(level: keyof typeof loggerLevelStringToConsolaLogLevelMap) {
        this.#logger.level = loggerLevelStringToConsolaLogLevelMap[level];
    }
}
