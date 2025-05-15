import {
  createClient,
  queryClients,
  getClientById,
  updateClient,
  deleteClient
} from '../../src/services/client.service';

import { Client } from '../../src/models';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

jest.mock('../../src/models/client.model');

const validClientInput = {
  name: 'Acme Inc.',
  contactName: 'John Doe',
  phoneNumber: '123-456-7890',
  email: 'new@example.com',
  street1: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62704',
  user: new mongoose.Types.ObjectId().toHexString(), // ✅ string
};

describe('createClient', () => {
  const mockFindOne = Client.findOne as jest.Mock;
  const mockCreate = Client.create as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('creates a client when email is not taken', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'id1', ...validClientInput });

    const result = await createClient(validClientInput);

    expect(result).toHaveProperty('_id', 'id1');
    expect(mockFindOne).toHaveBeenCalledWith({ email: validClientInput.email });
    expect(mockCreate).toHaveBeenCalledWith(validClientInput);
  });

  it('throws error if email already exists', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existing' });

    await expect(
        createClient({ ...validClientInput, email: 'test@example.com' })
    ).rejects.toThrow('Client with this email already exists.');
  });
});

describe('getClientById', () => {
  const mockFindById = Client.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('returns client if found', async () => {
    const mockClient = { _id: 'c1' };
    mockFindById.mockResolvedValue(mockClient);

    const result = await getClientById('c1');
    expect(result).toBe(mockClient);
  });

  it('throws error if not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(getClientById('bad')).rejects.toThrow('Client not found');
  });
});

describe('updateClient', () => {
  const mockFindById = Client.findById as jest.Mock;
  const mockFindOne = Client.findOne as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('updates client fields when valid', async () => {
    const save = jest.fn();
    const client = { _id: 'c1', email: 'old@example.com', save };
    mockFindById.mockResolvedValue(client);
    mockFindOne.mockResolvedValue(null);

    const result = await updateClient('c1', { email: 'new@example.com' });

    expect(client.email).toBe('new@example.com');
    expect(save).toHaveBeenCalled();
    expect(result).toBe(client);
  });

  it('throws if client not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(updateClient('bad', {})).rejects.toThrow('Client not found');
  });

  it('throws if new email is already in use', async () => {
    const client = { _id: 'c1', email: 'old@example.com' };
    mockFindById.mockResolvedValue(client);
    mockFindOne.mockResolvedValue({ _id: 'dup' });

    await expect(updateClient('c1', { email: 'dup@example.com' }))
        .rejects.toThrow('Client with this email already exists.');
  });
});

describe('deleteClient', () => {
  const mockDelete = Client.findByIdAndDelete as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('deletes client when found', async () => {
    mockDelete.mockResolvedValue({ _id: 'c1' });
    await expect(deleteClient('c1')).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith('c1');
  });

  it('throws if client not found', async () => {
    mockDelete.mockResolvedValue(null);
    await expect(deleteClient('bad')).rejects.toThrow('Client not found');
  });
});
