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
        const rule = createElFormItemRuleWithDefaults('This field is required');
        expect(rule).toEqual<FormItemRule>({
            message: 'This field is required',
            required: true,
            trigger: 'blur',
            type: 'string',
        });
    });

    it('should allow overriding required', ({ expect }) => {
        const rule = createElFormItemRuleWithDefaults('Optional field', { required: false });
        expect(rule.required).toBe(false);
        expect(rule.message).toBe('Optional field');
        expect(rule.trigger).toBe('blur');
        expect(rule.type).toBe('string');
    });

    it('should allow overriding trigger and type', ({ expect }) => {
        const rule = createElFormItemRuleWithDefaults(
            'Enter a number',
            {
                trigger: [
                    'change',
                    'blur',
                ],
                type: 'number',
            },
        );

        expect(rule.type).toBe('number');
        expect(rule.trigger).toEqual([
            'change',
            'blur',
        ]);
    });

    it('should preserve extra fields from options', ({ expect }) => {
        const customValidator = vi.fn();
        const rule = createElFormItemRuleWithDefaults(
            'With validator',
            {
                required: false,
                validator: customValidator,
            },
        );

        expect(rule.validator).toBe(customValidator);
        expect(rule.required).toBe(false);
        expect(rule.message).toBe('With validator');
    });

    it('should preserve explicitly set falsy values because ?? is used', ({ expect }) => {
        const rule = createElFormItemRuleWithDefaults(
            'Custom trigger and type',
            {
                required: false,
                trigger: '',
                type: '' as RuleType,
            },
        );

        expect(rule.required).toBe(false);
        expect(rule.trigger).toBe('');
        expect(rule.type).toBe('');
    });
});
