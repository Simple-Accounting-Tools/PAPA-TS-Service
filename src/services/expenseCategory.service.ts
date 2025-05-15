import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { ExpenseCategory, ExpenseCategoryDocument } from '../models/expenseCategory.model';
import {
    CreateExpenseCategoryInput,
    UpdateExpenseCategoryInput,
    QueryExpenseCategoryFilter,
} from '../types/expenseCategory';
import { QueryOptions } from '../types/common';

export const createExpenseCategory = async (
    body: CreateExpenseCategoryInput
): Promise<ExpenseCategoryDocument> => {
    const existing = await ExpenseCategory.findOne({ name: body.name });
    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Expense category with this name already exists.');
    }
    return ExpenseCategory.create(body);
};

export const queryExpenseCategories = async (
    filter: QueryExpenseCategoryFilter,
    options: QueryOptions
) => {
    const newFilter = {
        ...(filter.name ? { name: { $regex: new RegExp(filter.name, 'i') } } : {})
    };
    return ExpenseCategory.paginate(newFilter, options);
};

export const getExpenseCategoryById = async (id: string): Promise<ExpenseCategoryDocument> => {
    const expenseCategory = await ExpenseCategory.findById(id);
    if (!expenseCategory) throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
    return expenseCategory;
};

export const updateExpenseCategory = async (
    id: string,
    updateBody: UpdateExpenseCategoryInput
): Promise<ExpenseCategoryDocument> => {
    const expenseCategory = await ExpenseCategory.findById(id);
    if (!expenseCategory) throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');

    Object.assign(expenseCategory, updateBody);
    return expenseCategory.save();
};

export const deleteExpenseCategory = async (id: string): Promise<void> => {
    const deleted = await ExpenseCategory.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
};
