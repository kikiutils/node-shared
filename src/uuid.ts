import { uuid } from 'short-uuid';

import { readFileSync, saveFileSync } from './file';

export const getUUID = (path = './uuid.uuid') => {
	const nowUUID = readFileSync(path);
	if (nowUUID) return nowUUID.toString();
	const newUUID = uuid();
	saveFileSync(path, newUUID);
	return newUUID;
}
