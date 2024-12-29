import { readFile, readFileSync, writeFile, writeFileSync } from '@kikiutils/fs-extra';
import type { PathLike, PathOrFileDescriptor } from 'fs';
import type { FileHandle } from 'fs/promises';
import { uuid } from 'short-uuid';

export const getUUID = async (path: FileHandle | PathLike = './uuid.uuid') => {
	const nowUUIDFile = await readFile(path);
	if (nowUUIDFile) return nowUUIDFile.toString();
	const newUUID = uuid();
	await writeFile(path, newUUID);
	return newUUID;
};

export const getUUIDSync = (path: PathOrFileDescriptor = './uuid.uuid') => {
	const nowUUIDFile = readFileSync(path);
	if (nowUUIDFile) return nowUUIDFile.toString();
	const newUUID = uuid();
	writeFileSync(path, newUUID);
	return newUUID;
};
