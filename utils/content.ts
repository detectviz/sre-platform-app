export const formatContentString = (
    template: string | undefined,
    variables: Record<string, string | number | undefined>
): string | undefined => {
    if (!template) {
        return undefined;
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = variables[key];
        if (value === undefined || value === null) {
            return `{${key}}`;
        }
        return String(value);
    });
};
