import { setReadonlyConstantToGlobalThis } from '../src/object';

describe('setReadonlyConstantToGlobalThis', () => {
	const constantValue = 'testValue';
	it('should define a readonly constant on globalThis', () => {
		const constantName = Math.random().toString(36).substring(2, 15);
		setReadonlyConstantToGlobalThis(constantName, constantValue);
		expect((globalThis as any)[constantName]).toBe(constantValue);
		expect(() => ((globalThis as any)[constantName] = 'newValue')).toThrow(TypeError);
		expect((globalThis as any)[constantName]).toBe(constantValue);
	});

	it('should not be configurable', () => {
		const constantName = Math.random().toString(36).substring(2, 15);
		setReadonlyConstantToGlobalThis(constantName, constantValue);
		const deleteResult = delete (globalThis as any)[constantName];
		expect(deleteResult).toBe(false);
		expect((globalThis as any)[constantName]).toBe(constantValue);
	});

	it('should allow passing additional attributes', () => {
		const constantName = Math.random().toString(36).substring(2, 15);
		setReadonlyConstantToGlobalThis(constantName, constantValue, { enumerable: true });
		expect(Object.getOwnPropertyDescriptor(globalThis, constantName)?.enumerable).toBe(true);
	});

	it('should not be writable', () => {
		const constantName = Math.random().toString(36).substring(2, 15);
		setReadonlyConstantToGlobalThis(constantName, constantValue);
		expect(Object.getOwnPropertyDescriptor(globalThis, constantName)?.writable).toBe(false);
	});
});
