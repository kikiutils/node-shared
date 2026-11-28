import type { FormItemRule } from 'element-plus';

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
