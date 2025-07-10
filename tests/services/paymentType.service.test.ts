import {
  createPaymentType,
  queryPaymentTypes,
  getPaymentTypeById,
  updatePaymentType,
  deletePaymentType
} from '../../src/services/paymentType.service';
import { PaymentType, Client } from '../../src/models';

jest.mock('../../src/models/paymentType.model');
jest.mock('../../src/models/client.model');

describe('createPaymentType', () => {
  const mockFindClient = Client.findById as jest.Mock;
  const mockCreate = PaymentType.create as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('creates payment type when client exists', async () => {
    const input = { name: 'Credit Card', details: '4111111111111234', clientId: 'c1' };
    mockFindClient.mockResolvedValue({ _id: 'c1' });
    mockCreate.mockResolvedValue({ _id: 'pt1', ...input });

    const result = await createPaymentType(input);
    expect(result).toHaveProperty('_id', 'pt1');
    expect(mockCreate).toHaveBeenCalledWith(input);
  });

  it('throws if client not found', async () => {
    mockFindClient.mockResolvedValue(null);
    await expect(createPaymentType({ name: 'x', details: '0000111122223333', clientId: 'bad' }))
      .rejects.toThrow('Client not found');
  });
});

describe('queryPaymentTypes', () => {
  const mockPaginate = PaymentType.paginate as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('applies filters correctly', async () => {
    mockPaginate.mockResolvedValue({ docs: [] });
    await queryPaymentTypes({ name: 'Credit' }, { page: 1, limit: 5 });
    expect(mockPaginate).toHaveBeenCalledWith(
      { name: { $regex: expect.any(RegExp) } },
      expect.objectContaining({ page: 1, limit: 5 })
    );
  });
});

describe('getPaymentTypeById', () => {
  const mockFindById = PaymentType.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('returns payment type if found', async () => {
    mockFindById.mockResolvedValue({ _id: 'pt1' });
    const result = await getPaymentTypeById('pt1');
    expect(result).toHaveProperty('_id', 'pt1');
  });

  it('throws if not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(getPaymentTypeById('bad')).rejects.toThrow('Payment type not found');
  });
});

describe('updatePaymentType', () => {
  const mockFindById = PaymentType.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('updates and saves payment type', async () => {
    const save = jest.fn();
    const pt = { _id: 'pt1', name: 'Old', save };
    mockFindById.mockResolvedValue(pt);
    const result = await updatePaymentType('pt1', { name: 'New' });
    expect(result.name).toBe('New');
    expect(save).toHaveBeenCalled();
  });

  it('throws if not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(updatePaymentType('bad', {})).rejects.toThrow('Payment type not found');
  });
});

describe('deletePaymentType', () => {
  const mockDelete = PaymentType.findByIdAndDelete as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('deletes payment type', async () => {
    mockDelete.mockResolvedValue({ _id: 'pt1' });
    await expect(deletePaymentType('pt1')).resolves.toBeUndefined();
  });

  it('throws if not found', async () => {
    mockDelete.mockResolvedValue(null);
    await expect(deletePaymentType('bad')).rejects.toThrow('Payment type not found');
  });
});
