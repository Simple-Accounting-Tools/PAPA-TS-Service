import {
  createProfile,
  queryProfiles,
  getProfileById,
  updateProfileById,
  deleteProfileById
} from '../../src/services/profile.service';
import { User } from '../../src/models/user.model';
import httpStatus from 'http-status';
import ApiError from '../../src/utils/ApiError';

jest.mock('../../src/models/user.model');

describe('Profile Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a profile via user service', async () => {
      (User.isEmailTaken as jest.Mock).mockResolvedValue(false);
      (User.create as jest.Mock).mockResolvedValue({ _id: 'u1', email: 'p@test.com' });
      const result = await createProfile({ name: 'Test', email: 'p@test.com', password: 'pass1234', role: 'user' });
      expect(result).toHaveProperty('_id', 'u1');
    });
  });

  describe('queryProfiles', () => {
    it('passes select fields to paginate', async () => {
      (User.paginate as jest.Mock).mockResolvedValue({ docs: [] });
      await queryProfiles({}, { page: 1, limit: 10, fields: ['email'] });
      expect(User.paginate).toHaveBeenCalledWith({}, expect.objectContaining({ select: 'email' }));
    });
  });

  describe('getProfileById', () => {
    it('selects requested fields', async () => {
      (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'u1' }) });
      const user = await getProfileById('u1', ['email']);
      const selectMock = (User.findById as jest.Mock).mock.results[0].value.select as jest.Mock;
      expect(selectMock).toHaveBeenCalledWith('email');
      expect(user).toHaveProperty('_id', 'u1');
    });

    it('throws if not found', async () => {
      (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await expect(getProfileById('bad', ['email'])).rejects.toThrow('User not found');
    });
  });

  describe('updateProfileById', () => {
    it('delegates to updateUserById', async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'u1', save: jest.fn() });
      (User.isEmailTaken as jest.Mock).mockResolvedValue(false);
      const result = await updateProfileById('u1', { name: 'New' });
      expect(result).toHaveProperty('_id', 'u1');
    });
  });

  describe('deleteProfileById', () => {
    it('delegates to deleteUserById', async () => {
      const deleteOne = jest.fn();
      (User.findById as jest.Mock).mockResolvedValue({ deleteOne });
      await deleteProfileById('u1');
      expect(deleteOne).toHaveBeenCalled();
    });
  });
});
