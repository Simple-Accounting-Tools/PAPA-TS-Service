import {
  createVendor,
  getVendorById,
  updateVendor,
  deleteVendor,
  queryVendors,
} from '../../src/services/vendor.service';
import { Client, Vendor } from '../../src/models';
import mongoose from 'mongoose';

jest.mock('../../src/models/client.model');
jest.mock('../../src/models/vendor.model');

describe('Vendor Service', () => {
  const mockFindClient = Client.findById as jest.Mock;
  const mockFindVendor = Vendor.findById as jest.Mock;
  const mockCreateVendor = Vendor.create as jest.Mock;
  const mockFindOne = Vendor.findOne as jest.Mock;
  const mockPaginate = Vendor.paginate as jest.Mock;
  const mockFindByIdAndDelete = Vendor.findByIdAndDelete as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  describe('createVendor', () => {
    it('creates a vendor when input is valid', async () => {
      const body = {
        clientId: 'client1',
        email: 'test@vendor.com',
        name: 'Test Vendor',
        attachments: ['60f7f6b6b5484f3f183b62a1'],
        street1: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
      };

      mockFindClient.mockResolvedValue({ _id: 'client1' });
      mockFindOne.mockResolvedValue(null);
      mockCreateVendor.mockResolvedValue({ _id: 'vendor1', ...body });

      const result = await createVendor(body);

      expect(mockFindClient).toHaveBeenCalledWith('client1');
      expect(mockCreateVendor).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Test Vendor', email: 'test@vendor.com' })
      );
      expect(result).toHaveProperty('_id', 'vendor1');
    });

    it('throws error if client is not found', async () => {
      mockFindClient.mockResolvedValue(null);
      await expect(
          createVendor({ clientId: 'missing', email: 'x', name: 'y', street1: '', city: '', state: '', zipCode: '' })
      ).rejects.toThrow('Client not found');
    });

    it('throws error if duplicate vendor exists', async () => {
      mockFindClient.mockResolvedValue({ _id: 'client1' });
      mockFindOne.mockResolvedValue({ email: 'exists@vendor.com' });

      await expect(
          createVendor({ clientId: 'client1', email: 'exists@vendor.com', name: 'x', street1: '', city: '', state: '', zipCode: '' })
      ).rejects.toThrow('Vendor with this email already exists');
    });
  });

  describe('getVendorById', () => {
    it('returns vendor if found', async () => {
      const mockVendor = { _id: 'v1', name: 'Vendor X' };
      mockFindVendor.mockImplementation((id: string) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return Promise.resolve(mockVendor);
      });
      const result = await getVendorById('60f7f6b6b5484f3f183b62a1');
      expect(result).toHaveProperty('name', 'Vendor X');
    });

    it('throws if invalid ID format', async () => {
      await expect(getVendorById('bad-id')).rejects.toThrow('Invalid vendor ID');
    });

    it('throws if vendor not found', async () => {
      mockFindVendor.mockResolvedValue(null);
      await expect(getVendorById('60f7f6b6b5484f3f183b62a1')).rejects.toThrow('Vendor not found');
    });
  });

  describe('updateVendor', () => {
    it('updates and saves vendor if valid', async () => {
      const save = jest.fn();
      const vendor = { _id: 'v1', email: 'old@vendor.com', clientId: 'c1', save };

      mockFindVendor.mockResolvedValue(vendor);
      mockFindOne.mockResolvedValue(null);

      const updated = await updateVendor('v1', { email: 'new@vendor.com' });

      expect(save).toHaveBeenCalled();
      expect(updated).toBe(vendor);
    });

    it('throws if vendor not found', async () => {
      mockFindVendor.mockResolvedValue(null);
      await expect(updateVendor('bad', { name: 'x' })).rejects.toThrow('Vendor not found');
    });

    it('throws on duplicate email', async () => {
      const vendor = { _id: 'v1', email: 'old@vendor.com', clientId: 'c1', save: jest.fn() };
      mockFindVendor.mockResolvedValue(vendor);
      mockFindOne.mockResolvedValue({ _id: 'v2' });
      await expect(updateVendor('v1', { email: 'dup@vendor.com' })).rejects.toThrow(
          'Vendor with this email already exists'
      );
    });
  });

  describe('deleteVendor', () => {
    it('deletes and returns vendor if exists', async () => {
      mockFindByIdAndDelete.mockResolvedValue({ _id: 'v1' });
      await expect(deleteVendor('v1')).resolves.toBeUndefined();
    });

    it('throws if vendor not found', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      await expect(deleteVendor('bad-id')).rejects.toThrow('Vendor not found');
    });
  });

  describe('queryVendors', () => {
    it('returns paginated vendors', async () => {
      mockPaginate.mockResolvedValue({ docs: [], totalPages: 1 });
      const result = await queryVendors({}, { limit: 10, page: 1 });
      expect(result).toHaveProperty('totalPages', 1);
    });
  });
});
