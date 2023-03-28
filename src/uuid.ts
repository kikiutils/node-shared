import { readFile, readFileSync } from 'fs-extra';
import { uuid } from 'short-uuid';

import { saveFile, saveFileSync } from '@/file';

export const getUUID = async (path = './uuid.uuid') => {
	try {
		const nowUUID = (await readFile(path)).toString();
		if (nowUUID) return nowUUID;
	} catch (_) { }

	const newUUID = uuid();
	await saveFile(path, newUUID);
	return newUUID;
}

export const getUUIDSync = (path = './uuid.uuid') => {
	try {
		const nowUUID = readFileSync(path).toString();
		if (nowUUID) return nowUUID;
	} catch (_) { }

	const newUUID = uuid();
	saveFileSync(path, newUUID);
	return newUUID;
}
