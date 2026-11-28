import type { FormItemRule } from 'element-plus';

/**
 * Defaults to `required: true`, `trigger: 'blur'`, and `type: 'string'`; options left `undefined` use those defaults.
 * The `message` argument takes precedence over `options.message`.
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
