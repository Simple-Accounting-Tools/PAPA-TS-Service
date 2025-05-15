import express from 'express';
import * as expenseCategoryController from '../controllers/expenseCategory.controller';

const router = express.Router();

router
    .route('/')
    .post(expenseCategoryController.createExpenseCategory)
    .get(expenseCategoryController.getExpenseCategories);

router
    .route('/:categoryId')
    .get(expenseCategoryController.getExpenseCategoryById)
    .patch(expenseCategoryController.updateExpenseCategory)
    .delete(expenseCategoryController.deleteExpenseCategory);

export default router;
