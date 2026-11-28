import type { FormItemRule } from 'element-plus';
import {
    describe,
    it,
} from 'vitest';

import { createElFormItemRuleWithDefaults } from '../src/element-plus';

describe('createElFormItemRuleWithDefaults', () => {
    it.for([
        {
            name: 'omitted',
            options: undefined,
        },
        {
            name: 'undefined',
            options: {
                required: undefined,
                trigger: undefined,
                type: undefined,
            },
        },
    ])(
        'should create a required string rule validated on blur when the options are $name',
        ({ options }, { expect }) => {
            expect(createElFormItemRuleWithDefaults('Required', options)).toEqual<FormItemRule>({
                message: 'Required',
                required: true,
                trigger: 'blur',
                type: 'string',
            });
        },
    );

    it('should override defaults while preserving extra fields and the original options', ({ expect }) => {
        const validator = () => true;
        const options = Object.freeze({
            message: 'Ignored',
            required: false,
            trigger: [
                'change',
                'blur',
            ],
            type: 'number' as const,
            validator,
        });

        const result = createElFormItemRuleWithDefaults('Explicit', options);

        expect(result).toEqual({
            ...options,
            message: 'Explicit',
        });

        expect(result).not.toBe(options);
        expect(result.validator).toBe(validator);
        expect(options.message).toBe('Ignored');
    });
});
