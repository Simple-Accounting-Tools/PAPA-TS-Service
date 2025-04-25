export interface CreateExpenseCategoryInput {
    name: string;
    description?: string;
}

export interface UpdateExpenseCategoryInput {
    name?: string;
    description?: string;
}

export interface QueryExpenseCategoryFilter {
    name?: string;
}
