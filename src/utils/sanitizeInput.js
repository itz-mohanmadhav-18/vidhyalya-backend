import sanitizeHtml from "sanitize-html";
import xss from "xss";

/**
 * Sanitizes user input before validation.
 * @param {Object} inputData - The raw user input.
 * @returns {Object} - Sanitized input.
 */
export const sanitizeInput = (inputData) => {
    if (!inputData || typeof inputData !== 'object') {
        return inputData;
    }

    const sanitizedData = {};

    for (const [key, value] of Object.entries(inputData)) {
        // Handle different types of data
        if (typeof value === "string") {
            // For strings, sanitize HTML and XSS payloads
            let sanitizedValue = value.trim();
            sanitizedValue = sanitizeHtml(sanitizedValue, {
                allowedTags: [], // Remove all HTML tags
                allowedAttributes: {}, // Remove all attributes
            });
            sanitizedValue = xss(sanitizedValue); // Remove XSS payloads

            // NoSQL injection prevention (better than string escaping)
            // We can validate against expected formats rather than trying to escape
            if (key === '_id' && !/^[a-zA-Z0-9]{8,10}$/.test(sanitizedValue)) {
                throw new Error(`Invalid ID format: ${key}`);
            }

            sanitizedData[key] = sanitizedValue;
        } else if (Array.isArray(value)) {
            // For arrays, sanitize each string element
            sanitizedData[key] = value.map(item =>
                typeof item === "string" ? xss(sanitizeHtml(item.trim(), {
                    allowedTags: [],
                    allowedAttributes: {},
                })) : item
            );
        } else if (value === null || value === undefined) {
            // Nullish values pass through
            sanitizedData[key] = value;
        } else if (typeof value === 'object') {
            // Recursive handling for nested objects
            sanitizedData[key] = sanitizeInput(value);
        } else {
            // Numbers, booleans, etc. pass through
            sanitizedData[key] = value;
        }
    }

    return sanitizedData;
};