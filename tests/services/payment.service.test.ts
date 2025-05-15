import {
  createPayment,
  queryPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} from '../../src/services/payment.service';

import { Payment, Client } from '../../src/models';
import * as billService from '../../src/services/bill.service';
import * as attachmentService from '../../src/services/attachment.service';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

jest.mock('../../src/models/payment.model');
jest.mock('../../src/models/client.model');
jest.mock('../../src/services/bill.service');
jest.mock('../../src/services/attachment.service');

describe('createPayment', () => {
  const mockFindClient = Client.findById as jest.Mock;
  const mockCalculate = billService.calculateRemainingAmount as jest.Mock;
  const mockSave = attachmentService.saveAttachments as jest.Mock;
  const mockAppend = billService.appendPaymentToBill as jest.Mock;
  const mockGetBill = billService.getBillById as jest.Mock;
  const mockCreate = Payment.create as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*it('creates payment with attachments', async () => {
    const body = {
      clientId: 'c1',
      bill: 'b1',
      amount: 100,
      paymentMethod: 'card'
    };

    const files = [{ originalname: 'proof.pdf' }] as any;

    mockFindClient.mockResolvedValue({ _id: 'c1' });
    mockCalculate.mockResolvedValue({ billId: 'b1', remainingAmount: 200, status: 'unpaid' });
    mockSave.mockResolvedValue([{ id: 'att1' }]);
    mockCreate.mockResolvedValue({ id: 'pay1', amount: 95, discount: 5 });
    mockAppend.mockResolvedValue(undefined);
    mockGetBill.mockResolvedValue({});

    const result = await createPayment(body, files);

    expect(result).toHaveProperty('id', 'pay1');
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ amount: expect.any(Number) }));
    expect(mockAppend).toHaveBeenCalled();
  });*/

  it('throws if client not found', async () => {
    mockFindClient.mockResolvedValue(null);
    await expect(createPayment({ clientId: 'cX', bill: 'b1', amount: 100, paymentMethod: 'cash' }))
        .rejects.toThrow('Client not found');
  });

  it('throws if bill is already paid', async () => {
    mockFindClient.mockResolvedValue({ _id: 'c1' });
    mockCalculate.mockResolvedValue({ status: 'paid' });

    await expect(createPayment({ clientId: 'c1', bill: 'b1', amount: 100, paymentMethod: 'cash' }))
        .rejects.toThrow('Bill does not have any due amount');
  });

  it('throws if amount exceeds remaining', async () => {
    mockFindClient.mockResolvedValue({ _id: 'c1' });
    mockCalculate.mockResolvedValue({ remainingAmount: 50, status: 'unpaid' });

    await expect(createPayment({ clientId: 'c1', bill: 'b1', amount: 100, paymentMethod: 'cash' }))
        .rejects.toThrow('Payment amount cannot exceed 50');
  });
});

describe('queryPayments', () => {
  const mockPaginate = Payment.paginate as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('queries with min and max', async () => {
    mockPaginate.mockResolvedValue({ docs: [] });

    await queryPayments({ minAmount: 50, maxAmount: 100 }, { limit: 5, page: 1 });

    expect(mockPaginate).toHaveBeenCalledWith(
        { amount: { $gte: 50, $lte: 100 } },
        expect.objectContaining({ limit: 5, page: 1 })
    );
  });
});

describe('getPaymentById', () => {
  it('returns payment when found', async () => {
    const mockPayment = { _id: 'pay1', amount: 100 };
    const mockPopulate = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPayment),
    });

    (Payment.findById as jest.Mock).mockReturnValue({ populate: mockPopulate });

    const result = await getPaymentById('pay1');
    expect(result).toHaveProperty('_id', 'pay1');
  });

  it('throws error when payment not found', async () => {
    const mockPopulate = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    (Payment.findById as jest.Mock).mockReturnValue({ populate: mockPopulate });

    await expect(getPaymentById('invalid')).rejects.toThrow('Payment not found');
  });
});

describe('updatePayment', () => {
  const mockFind = Payment.findById as jest.Mock;
  const mockDeleteAttachments = attachmentService.deleteAttachments as jest.Mock;
  const mockSaveAttachments = attachmentService.saveAttachments as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('updates attachments and saves payment', async () => {
    const save = jest.fn();
    const payment = {
      _id: 'p1',
      attachments: [{ _id: 'a1' }, { _id: 'a2' }],
      save
    };
    mockFind.mockResolvedValue(payment);
    mockDeleteAttachments.mockResolvedValue(undefined);
    mockSaveAttachments.mockResolvedValue([{ id: 'a3' }]);

    const body = { deletedFiles: ['a2'] };
    await updatePayment('p1', body, [{ originalname: 'f.pdf' }] as any);

    expect(payment.attachments).toContain('a3');
    expect(save).toHaveBeenCalled();
  });

  it('throws if not found', async () => {
    mockFind.mockResolvedValue(null);
    await expect(updatePayment('none', {})).rejects.toThrow('Payment not found');
  });
});

describe('deletePayment', () => {
  const mockDelete = Payment.findByIdAndDelete as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('removes and returns the payment', async () => {
    mockDelete.mockResolvedValue({ _id: 'pay1' });

    const result = await deletePayment('pay1');
    expect(result).toHaveProperty('_id', 'pay1');
  });

  it('throws if not found', async () => {
    mockDelete.mockResolvedValue(null);
    await expect(deletePayment('bad')).rejects.toThrow('Payment not found');
  });
});
