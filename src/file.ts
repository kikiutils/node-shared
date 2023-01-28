import {
	readFile as _readFile,
	readFileSync as _readFileSync,
	writeFile as _writeFile,
	writeFileSync as _writeFileSync,
	WriteFileOptions
} from 'fs-extra';

export const readFile = async (path: string) => {
	try {
		return new Blob([await _readFile(path)]);
	} catch (_) { }
}

export const readFileSync = (path: string) => {
	try {
		return new Blob([_readFileSync(path)]);
	} catch (_) { }
}

export const saveFile = async (path: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) => {
	try {
		await _writeFile(path, data, options);
		return true;
	} catch (_) { }
	return false;
}

export const saveFileSync = (path: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) => {
	try {
		_writeFileSync(path, data, options);
		return true;
	} catch (_) { }
	return false;
}
