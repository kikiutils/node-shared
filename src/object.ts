export const setReadonlyConstantToGlobalThis = (name: string, value: any, attributes?: PropertyDescriptor & ThisType<any>) => {
	Object.defineProperty(globalThis, name, {
		...attributes,
		configurable: false,
		value,
		writable: false
	});
};
