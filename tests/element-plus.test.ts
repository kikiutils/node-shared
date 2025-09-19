import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';
import {
    describe,
    it,
    vi,
} from 'vitest';

import { createElFormItemRuleWithDefaults } from '../src/element-plus';

describe.concurrent('createElFormItemRuleWithDefaults', () => {
    it('should create a rule with default values', ({ expect }) => {
        const result = createElFormItemRuleWithDefaults('This field is required');
        expect(result).toEqual<FormItemRule>({
            message: 'This field is required',
            required: true,
            trigger: 'blur',
            type: 'string',
        });
    });

    it('should allow overriding required', ({ expect }) => {
        const result = createElFormItemRuleWithDefaults('Optional field', { required: false });
        expect(result.required).toBe(false);
        expect(result.message).toBe('Optional field');
        expect(result.trigger).toBe('blur');
        expect(result.type).toBe('string');
    });

    it('should allow overriding trigger and type', ({ expect }) => {
        const result = createElFormItemRuleWithDefaults(
            'Enter a number',
            {
                trigger: [
                    'change',
                    'blur',
                ],
                type: 'number',
            },
        );

        expect(result.type).toBe('number');
        expect(result.trigger).toEqual([
            'change',
            'blur',
        ]);
    });

    it('should preserve extra fields from options', ({ expect }) => {
        const customValidator = vi.fn();

        const result = createElFormItemRuleWithDefaults(
            'With validator',
            {
                required: false,
                validator: customValidator,
            },
        );

        expect(result.validator).toBe(customValidator);
        expect(result.required).toBe(false);
        expect(result.message).toBe('With validator');
    });

    it('should preserve explicitly set falsy values because ?? is used', ({ expect }) => {
        const result = createElFormItemRuleWithDefaults(
            'Custom trigger and type',
            {
                required: false,
                trigger: '',
                type: '' as RuleType,
            },
        );

        expect(result.required).toBe(false);
        expect(result.trigger).toBe('');
        expect(result.type).toBe('');
    });
});
