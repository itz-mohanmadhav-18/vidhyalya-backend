import { RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize Rate Limiter (5 attempts per 1 minute per EmployeeID)
const rateLimiter = new RateLimiterMemory({
    points: 5, // Allow max 5 attempts
    duration: 60*15, // Reset every 15 minutes
});

// Function to check rate limit
export const limitRequest = async (key) => {
    try {
        await rateLimiter.consume(key);
    } catch (error) {
        throw new Error('Too many login attempts. Please try again later.');
    }
};
