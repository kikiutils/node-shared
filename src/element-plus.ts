import type { FormItemRule } from 'element-plus';

/**
 * Creates a new Element Plus form validation rule with overridable defaults.
 *
 * @remarks
 * Defaults to `required: true`, `trigger: 'blur'`, and `type: 'string'`.
 * Options left `undefined` use those defaults.
 * The `message` argument takes precedence over `options.message`.
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
