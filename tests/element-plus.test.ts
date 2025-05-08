import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';

import { createElFormItemRuleWithDefaults } from '../src/element-plus';

describe('createElFormItemRuleWithDefaults', () => {
    it('should create a rule with default values', () => {
        const rule = createElFormItemRuleWithDefaults('This field is required');
        expect(rule).toEqual<FormItemRule>({
            message: 'This field is required',
            required: true,
            trigger: 'blur',
            type: 'string',
        });
    });

    it('should allow overriding required', () => {
        const rule = createElFormItemRuleWithDefaults('Optional field', { required: false });
        expect(rule.required).toBe(false);
        expect(rule.message).toBe('Optional field');
        expect(rule.trigger).toBe('blur');
        expect(rule.type).toBe('string');
    });

    it('should allow overriding trigger and type', () => {
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

    it('should preserve extra fields from options', () => {
        const customValidator = jest.fn();
        const rule = createElFormItemRuleWithDefaults('With validator', {
            required: false,
            validator: customValidator,
        });

        expect(rule.validator).toBe(customValidator);
        expect(rule.required).toBe(false);
        expect(rule.message).toBe('With validator');
    });

    it('should preserve explicitly set falsy values because ?? is used', () => {
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
