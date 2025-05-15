/**
 * Common pagination & sorting options used across services
 */
export interface QueryOptions {
    sortBy?: string;
    limit?: number;
    page?: number;
}
