import mongoose, { Document, Model, Schema } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';

export interface IExpenseCategory {
    name: string;
    description?: string;
}

export interface ExpenseCategoryDocument extends IExpenseCategory, Document {}

export interface ExpenseCategoryModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const expenseCategorySchema = new Schema<ExpenseCategoryDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
    },
    { timestamps: true }
);

expenseCategorySchema.plugin(toJSON);
expenseCategorySchema.plugin(paginate);

export const ExpenseCategory = mongoose.model<
    ExpenseCategoryDocument,
    ExpenseCategoryModel<ExpenseCategoryDocument>
>('ExpenseCategory', expenseCategorySchema);
