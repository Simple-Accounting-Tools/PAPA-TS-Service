import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from '../utils/plugins';
import { roles } from '../config/roles';
import { UserAttributes } from '../types/user';

/**
 * Mongoose Document for User
 */
export interface UserDocument extends UserAttributes, Document {
    isPasswordMatch(password: string): Promise<boolean>;
}

/**
 * Mongoose Model for User with paginate & static methods
 */
interface UserModel extends Model<UserDocument> {
    paginate(filter: any, options: any): Promise<any>;
    isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

const mailingAddressSchema = new Schema<UserAttributes['mailingAddress']>(
    {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
    },
    { _id: false }
);

const userSchema = new Schema<UserDocument, UserModel>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value: string) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value: string) {
                if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
                    throw new Error('Password must contain at least one letter and one number');
                }
            },
            private: true,
        },
        role: { type: String, enum: roles, default: 'user' },
        isEmailVerified: { type: Boolean, default: false },
        mailingAddress: { type: mailingAddressSchema },
        website: { type: String },
        phoneNumber: { type: String },
    },
    { timestamps: true }
);

// Add plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is already taken
 */
userSchema.statics.isEmailTaken = async function (
    email: string,
    excludeUserId?: string
): Promise<boolean> {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Instance method to compare passwords
 */
userSchema.methods.isPasswordMatch = async function (
    password: string
): Promise<boolean> {
    const user = this as UserDocument;
    return bcrypt.compare(password, user.password);
};

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
    const user = this as UserDocument;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);