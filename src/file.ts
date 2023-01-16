import { readFile as _readFile } from 'fs-extra';

export const readFile = async (path: string) => {
	const file = await _readFile(path);
	return new Blob([file]);
}
