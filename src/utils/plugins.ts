import mongoosePaginate from 'mongoose-paginate-v2';
import { Schema } from 'mongoose';

/**
 * toJSON plugin: transforms _id and __v for cleaner JSON output
 */
export function toJSON(schema: Schema<any, any>, opts?: any): void {
    schema.set('toJSON', {
        virtuals: true,
        transform(_doc: any, ret: any) {
            // rename fields
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    });
}

/**
 * paginate plugin: adds paginate() method using mongoose-paginate-v2
 */
export function paginate(schema: Schema<any, any>, opts?: any): void {
    schema.plugin(mongoosePaginate);
}
