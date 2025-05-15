import {
  createBill,
  queryBills,
  getBillById,
  updateBill,
  deleteBill,
  calculateRemainingAmount,
  appendPaymentToBill
} from '../../src/services/bill.service';

import { Client, Bill } from '../../src/models';
import { purchaseOrderService } from '../../src/services';
import { Request } from 'express';

import mongoose from 'mongoose';

jest.mock('../../src/models/client.model');
jest.mock('../../src/models/bill.model');
jest.mock('../../src/services', () => ({
  purchaseOrderService: {
    getPurchaseOrderById: jest.fn(),
    updatePurchaseOrderStatus: jest.fn(),
  },
}));

describe('createBill', () => {
  const mockFindByIdClient = Client.findById as jest.Mock;
  const mockGetPO = purchaseOrderService.getPurchaseOrderById as jest.Mock;
  const mockCreateBill = Bill.create as jest.Mock;
  const mockUpdatePOStatus = purchaseOrderService.updatePurchaseOrderStatus as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a bill when client and PO are valid', async () => {
    const req = {
      body: {
        clientId: 'client1',
        purchaseOrder: 'po1',
        billAmount: '200',
        notes: 'Valid bill',
      },
    } as unknown as Request;

    mockFindByIdClient.mockResolvedValue({ _id: 'client1' });
    mockGetPO.mockResolvedValue({ _id: 'po1', vendor: 'vendor1' });
    mockCreateBill.mockResolvedValue({ _id: 'bill1', billAmount: 200 });

    const result = await createBill(req);

    expect(result).toHaveProperty('_id', 'bill1');
    expect(mockCreateBill).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'client1',
      purchaseOrder: 'po1',
      vendor: 'vendor1',
      billAmount: 200,
      remainingAmount: 200,
    }));
    expect(mockUpdatePOStatus).toHaveBeenCalledWith('po1');
  });

  it('throws if client is not found', async () => {
    const req = { body: { clientId: 'badClient', purchaseOrder: 'po1', billAmount: '100' } } as Request;
    mockFindByIdClient.mockResolvedValue(null);

    await expect(createBill(req)).rejects.toThrow('Client not found');
  });

  it('throws if purchase order is not found', async () => {
    const req = { body: { clientId: 'client1', purchaseOrder: 'badPO', billAmount: '100' } } as Request;
    mockFindByIdClient.mockResolvedValue({ _id: 'client1' });
    mockGetPO.mockResolvedValue(null);

    await expect(createBill(req)).rejects.toThrow('Purchase order not found');
  });
});

describe('calculateRemainingAmount', () => {
  const mockFindById = Bill.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('returns remainingAmount and paid status', async () => {
    mockFindById.mockResolvedValue({ id: 'b1', remainingAmount: 0 });
    const result = await calculateRemainingAmount('b1');
    expect(result).toEqual({ billId: 'b1', remainingAmount: 0, status: 'paid' });
  });

  it('throws if bill not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(calculateRemainingAmount('missing')).rejects.toThrow('Bill not found');
  });
});

describe('appendPaymentToBill', () => {
  const mockFindById = Bill.findById as jest.Mock;
  const mockUpdatePOStatus = purchaseOrderService.updatePurchaseOrderStatus as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('updates remaining and status on bill', async () => {
    const save = jest.fn();
    const bill = { remainingAmount: 100, status: 'unpaid', payments: [], save, purchaseOrder: 'po123' };
    mockFindById.mockResolvedValue(bill);

    const validId = new mongoose.Types.ObjectId().toHexString();
    await appendPaymentToBill('b1', validId, 0, 'paid');

    expect(bill.remainingAmount).toBe(0);
    expect(bill.status).toBe('paid');
    expect(bill.payments).toContainEqual(expect.any(Object));
    expect(save).toHaveBeenCalled();
    expect(mockUpdatePOStatus).toHaveBeenCalledWith('po123');
  });

  it('throws if bill not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(appendPaymentToBill('missing', 'p1', 0, 'paid')).rejects.toThrow('Bill not found');
  });
});
