export default function pick<T extends object, K extends keyof T>(object: T, keys: K[]): Partial<T> {
    const result: Partial<T> = {};
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
    });
    return result;
}
// This utility function is used to pick specific keys from an object.