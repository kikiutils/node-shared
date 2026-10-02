import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';

export type DoNotRemoveOrUseThisType = RuleType;

/**
 * Creates a new Element Plus form validation rule with overridable defaults.
 *
 * @remarks
 * Defaults to `required: true`, `trigger: 'blur'`, and `type: 'string'`.
 * Options override those defaults and the supplied message, including explicitly provided `undefined` values.
 * The options object is unchanged.
 *
 * @param message - The validation message displayed on failure.
 * @param options - Rule fields that override the defaults and message.
 *
 * @returns A new `FormItemRule` object.
 *
 * @example
 *
 * ```ts
 * import { createElFormItemRuleWithDefaults } from '@kikiutils/shared/element-plus';
 *
 * const rule = createElFormItemRuleWithDefaults('This field is required');
 * const optionalRule = createElFormItemRuleWithDefaults('Optional field', { required: false });
 * ```
 */
export function createElFormItemRuleWithDefaults(
    message: FormItemRule['message'],
    options: FormItemRule = {},
): FormItemRule {
    return {
        ...options,
        message,
        required: options.required ?? true,
        trigger: options.trigger ?? 'blur',
        type: options.type ?? 'string',
    };
}
