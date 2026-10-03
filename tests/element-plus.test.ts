import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';
import {
    describe,
    it,
} from 'vitest';

import { createElFormItemRuleWithDefaults } from '../src/element-plus';

describe('createElFormItemRuleWithDefaults', () => {
    it('should create a rule with required string validation on blur by default', ({ expect }) => {
        expect(createElFormItemRuleWithDefaults('Required')).toEqual<FormItemRule>({
            message: 'Required',
            required: true,
            trigger: 'blur',
            type: 'string',
        });
    });

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

    it.for([
        undefined,
        null,
    ])(
        'should restore defaults for nullish options %s',
        (value, { expect }) => {
            // Exercise documented nullish runtime options excluded by the upstream type.
            const options = {
                required: value,
                trigger: value,
                type: value,
            } as unknown as FormItemRule;

            expect(createElFormItemRuleWithDefaults('Required', options)).toEqual({
                message: 'Required',
                required: true,
                trigger: 'blur',
                type: 'string',
            });
        },
    );

    it('should preserve explicitly supplied falsy overrides', ({ expect }) => {
        const result = createElFormItemRuleWithDefaults('Custom', {
            required: false,
            trigger: '',
            type: '' as RuleType,
        });

        expect(result).toEqual({
            message: 'Custom',
            required: false,
            trigger: '',
            type: '',
        });
    });
});
