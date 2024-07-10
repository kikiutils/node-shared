export const ksort = <T extends Record<string, any>>(object: T): T => {
	const keys = Object.keys(object).sort();
	const sortedObj: Record<string, any> = {};
	for (const key of keys) sortedObj[key] = object[key];
	return sortedObj as T;
};
