import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import * as expenseCategoryService from '../services/expenseCategory.service';
import pick from '../utils/pick';
import {
    CreateExpenseCategoryInput,
    UpdateExpenseCategoryInput,
    QueryExpenseCategoryFilter,
} from '../types/expenseCategory';

export const createExpenseCategory = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreateExpenseCategoryInput;
    const category = await expenseCategoryService.createExpenseCategory(body);
    res.status(httpStatus.CREATED).send({ category });
});

export const getExpenseCategories = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name']) as QueryExpenseCategoryFilter;
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await expenseCategoryService.queryExpenseCategories(filter, options);
    res.send({ docs: result.docs, ...result });
});

export const getExpenseCategoryById = catchAsync(async (req: Request, res: Response) => {
    const category = await expenseCategoryService.getExpenseCategoryById(req.params.categoryId);
    res.send({ category });
});

export const updateExpenseCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await expenseCategoryService.updateExpenseCategory(
        req.params.categoryId,
        req.body as UpdateExpenseCategoryInput
    );
    res.send({ category });
});

export const deleteExpenseCategory = catchAsync(async (req: Request, res: Response) => {
    await expenseCategoryService.deleteExpenseCategory(req.params.categoryId);
    res.status(httpStatus.OK).send();
});
