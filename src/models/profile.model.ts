import { User, UserDocument } from './user.model';

export type ProfileDocument = UserDocument;

// Re-export the User model under the Profile name for profile operations
export const Profile = User;
