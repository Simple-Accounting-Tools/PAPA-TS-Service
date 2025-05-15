/**
 * Converts a FormData object to a plain JSON object.
 *
 * @param formData - The FormData instance to convert.
 * @returns A plain object representing the FormData contents.
 */
export function formDataToJson(formData: FormData): Record<string, any> {
    const object: Record<string, any> = {};

    formData.forEach((value, key) => {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const existing = object[key];
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                object[key] = [existing, value];
            }
        } else {
            object[key] = value;
        }
    });


    return object;
}

/**
 * Prepares a request body for API submission.
 * If the body is FormData, it converts it to JSON and sets appropriate headers.
 *
 * @param body - The original request body.
 * @returns An object containing the new body and any additional headers needed.
 */
export function prepareBodyForApi(body: any): {
    body: any;
    headers?: Record<string, string>;
} {
    if (body instanceof FormData) {
        return {
            body: JSON.stringify(formDataToJson(body)),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }

    return { body };
}
