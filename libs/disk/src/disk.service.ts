import { Inject, Injectable, OnApplicationBootstrap, Scope } from '@nestjs/common';
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class DiskService implements OnApplicationBootstrap {
    private _storagePath = null;
    private _filesPath = null;

    public get storagePath() {
        return this._storagePath;
    }

    public get filesPath() {
        return this._filesPath;
    }

    constructor(@Inject('FILE_NAME') private fileName: string) {
        this._storagePath = path.join(os.homedir(), this.fileName || process.env.npm_package_name);
        this._filesPath = path.join(this.storagePath, 'files');
    }

    public createFileInStorage(fileName: string) {
        return path.join(this.filesPath, fileName);
    }

    public getFile(fileName: string) {
        if (!this.fileExists(fileName)) {
            return null;
        }

        return path.resolve(this.filesPath, fileName);
    }

    public fileExists(fileName: string): boolean {
        return fs.existsSync(path.resolve(this.filesPath, fileName));
    }

    public resetStorageDirectory(): void {
        fs.rmdirSync(this.storagePath, { recursive: true });
        this.createStorageDirectory();
    }

    public existsStorageDirectory(): boolean {
        return fs.existsSync(this.storagePath);
    }

    public createStorageDirectory(): void {
        fs.mkdirSync(this.storagePath);
    }

    public resetFilesDirectory(): void {
        fs.rmdirSync(this.filesPath, { recursive: true });
        this.createStorageDirectory();
    }

    public existsFilesDirectory(): boolean {
        return fs.existsSync(this.filesPath);
    }

    public createFilesDirectory(): void {
        fs.mkdirSync(this.filesPath);
    }

    onApplicationBootstrap() {
        // Create storage if not exists
        this.existsStorageDirectory() || this.createStorageDirectory();

        // Create files folder if not exists
        this.existsFilesDirectory() || this.createFilesDirectory();
    }
}
