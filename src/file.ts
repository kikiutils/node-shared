import { readFile, readFileSync } from '@kikiutils/fs-extra';
import { PathLike, PathOrFileDescriptor } from 'fs';
import { FileHandle } from 'fs/promises';

export const readFileToBlob = async (path: FileHandle | PathLike) => {
	const file = await readFile(path);
	if (file) return new Blob([file]);
};

export const readFileToBlobSync = (path: PathOrFileDescriptor) => {
	const file = readFileSync(path);
	if (file) return new Blob([file]);
};
