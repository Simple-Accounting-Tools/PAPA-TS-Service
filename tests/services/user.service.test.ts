import {
  createUser,
  queryUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../../src/services/user.service';
import { User } from '../../src/models/user.model';
import httpStatus from 'http-status';
import ApiError from '../../src/utils/ApiError';

jest.mock('../../src/models/user.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user if email is not taken', async () => {
      (User.isEmailTaken as jest.Mock).mockResolvedValue(false);
      (User.create as jest.Mock).mockResolvedValue({ _id: 'user1', email: 'test@example.com' });

      const result = await createUser({ name: 'Test', email: 'test@example.com', password: 'test1234', role: 'user' });
      expect(result).toHaveProperty('_id', 'user1');
    });

    it('should throw error if email is already taken', async () => {
      (User.isEmailTaken as jest.Mock).mockResolvedValue(true);

      await expect(createUser({ name: 'Test', email: 'taken@example.com', password: 'test1234', role: 'user' }))
          .rejects.toThrow('Email already taken');
    });
  });

  describe('queryUsers', () => {
    it('should return paginated users', async () => {
      (User.paginate as jest.Mock).mockResolvedValue({ docs: [], total: 0 });
      const result = await queryUsers({}, { page: 1, limit: 10 });
      expect(result).toHaveProperty('docs');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'user1' });
      const user = await getUserById('user1');
      expect(user).toHaveProperty('_id', 'user1');
    });

    it('should throw error if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      await expect(getUserById('missing')).rejects.toThrow('User not found');
    });
  });

  describe('updateUserById', () => {
    it('should update user when email is not taken', async () => {
      const save = jest.fn().mockResolvedValue({
        _id: 'user1',
        email: 'new@example.com',
        name: 'Updated'
      });

      const user = {
        _id: 'user1',
        email: 'old@example.com',
        name: 'Old',
        save
      };

      (User.findById as jest.Mock).mockResolvedValue(user);
      (User.isEmailTaken as jest.Mock).mockResolvedValue(false);

      const result = await updateUserById('user1', { email: 'new@example.com', name: 'Updated' });

      expect(save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should throw error if new email is taken', async () => {
      const user = { _id: 'user1', email: 'old@example.com', save: jest.fn() };
      (User.findById as jest.Mock).mockResolvedValue(user);
      (User.isEmailTaken as jest.Mock).mockResolvedValue(true);

      await expect(updateUserById('user1', { email: 'new@example.com' })).rejects.toThrow('Email already taken');
    });
  });

  describe('deleteUserById', () => {
    it('should delete the user', async () => {
      const deleteOne = jest.fn();
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'user1', deleteOne });
      await deleteUserById('user1');
      expect(deleteOne).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      await expect(deleteUserById('missing')).rejects.toThrow('User not found');
    });
  });
});
