import { readFileSync } from 'fs-extra';
import { uuid } from 'short-uuid';

import { saveFileSync } from './file';

export const getUUID = (path = './uuid.uuid') => {
	try {
		const nowUUID = readFileSync(path).toString();
		if (nowUUID) return nowUUID;
	} catch (_) {}

	const newUUID = uuid();
	saveFileSync(path, newUUID);
	return newUUID;
}
