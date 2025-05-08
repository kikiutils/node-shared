import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';

export type DoNotRemoveOrUseThisType = RuleType;

/**
 * Creates a reusable Element Plus `<el-form-item>` validation rule with sensible defaults.
 *
 * This utility provides default values for `required`, `trigger`, and `type`,
 * while allowing overrides via the `options` parameter. It simplifies common
 * form validation rule creation and ensures consistency across forms.
 *
 * @param {string} message - The validation message to display when the rule fails.
 * @param {FormItemRule} [options] - Optional overrides for the rule fields.
 * @param {boolean} [options.required] - Whether the field is required (default: `true`).
 * @param {string | string[]} [options.trigger] - The event(s) that trigger validation (default: `'blur'`).
 * @param {RuleType} [options.type] - The expected type of the field (default: `'string'`).
 *
 * @returns A `FormItemRule` object that can be used in Element Plus form validation.
 *
 * @example
 * ```typescript
 * const rule = createElFormItemRuleWithDefaults('This field is required');
 * const optionalRule = createElFormItemRuleWithDefaults('Optional field', { required: false });
 * ```
 */
export function createElFormItemRuleWithDefaults(message: string, options: FormItemRule = {}): FormItemRule {
    return {
        ...options,
        message,
        required: options.required ?? true,
        trigger: options.trigger ?? 'blur',
        type: options.type ?? 'string',
    };
}
