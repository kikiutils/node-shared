import { flattenToSingleValue, setReadonlyConstantToGlobalThis } from '../src';

describe('flattenToSingleValue', () => {
    it('should return the first element of an array', () => {
        const value = [1, 2];
        expect(flattenToSingleValue(value)).toBe(1);
    });

    it('should return the value itself if it is not an array', () => {
        const value = 42;
        expect(flattenToSingleValue(value)).toBe(42);
    });

    it('should return undefined if the array is empty and no default value is provided', () => {
        const value: number[] = [];
        expect(flattenToSingleValue(value)).toBeUndefined();
    });

    it('should return the default value if the array is empty and default value is provided', () => {
        const value: number[] = [];
        const defaultValue = 100;
        expect(flattenToSingleValue(value, defaultValue)).toBe(defaultValue);
    });

    it('should return the first element if the array is non-empty, ignoring default value', () => {
        const value = ['a', 'b'];
        const defaultValue = 'z';
        expect(flattenToSingleValue(value, defaultValue)).toBe('a');
    });

    it('should return the value itself if it is not an array, even if default value is provided', () => {
        const value = 'test';
        const defaultValue = 'default';
        expect(flattenToSingleValue(value, defaultValue)).toBe('test');
    });

    it('should return default value if value is null or undefined', () => {
        const value: undefined = undefined;
        const defaultValue = 'default';
        expect(flattenToSingleValue(value, defaultValue)).toBe(defaultValue);
    });
});

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
