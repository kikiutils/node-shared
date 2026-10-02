import type { RuleType } from 'async-validator';
import type { FormItemRule } from 'element-plus';

export type DoNotRemoveOrUseThisType = RuleType;

/**
 * Creates a new Element Plus form validation rule with overridable defaults.
 *
 * @remarks
 * Defaults to `required: true`, `trigger: 'blur'`, and `type: 'string'`.
 * Non-nullish options override those defaults; `null` and `undefined` use the defaults.
 * The `message` argument takes precedence over `options.message`.
 * The options object is unchanged.
 *
 * @param message - The validation message displayed on failure.
 * @param options - Additional rule fields and non-nullish overrides for the defaults; `message` takes precedence.
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
