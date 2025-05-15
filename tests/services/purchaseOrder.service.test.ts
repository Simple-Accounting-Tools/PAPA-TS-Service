import {
  createPurchaseOrder,
  deletePurchaseOrder, getPurchaseOrderById, queryPurchaseOrders, updatePurchaseOrder,
  updatePurchaseOrderStatus
} from '../../src/services/purchaseOrder.service';
import * as attachmentService from '../../src/services/attachment.service';
import { Request } from 'express';
import { Client, Product, PurchaseOrder, Bill } from '../../src/models';
import {deleteAttachments} from "../../src/services/attachment.service";

jest.mock('../../src/models/purchaseOrder.model');
jest.mock('../../src/models/client.model');
jest.mock('../../src/models/product.model');
jest.mock('../../src/services/attachment.service');
jest.mock(`../../src/models/bill.model`);

describe('createPurchaseOrder', () => {
  const mockFindByIdClient = Client.findById as jest.Mock;
  const mockFindByIdProduct = Product.findById as jest.Mock;
  const mockSaveAttachments = jest.spyOn(attachmentService, 'saveAttachmentsFromRequest');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a purchase order when input is valid', async () => {
    const req = {
      body: {
        clientId: 'mockClientId',
        items: [
          {
            product: 'mockProductId',
            quantity: 2,
            rate: 50,
          },
        ],
        totalAmount: 100,
      },
    } as unknown as Request;

    mockFindByIdClient.mockResolvedValue({ _id: 'mockClientId' });
    mockFindByIdProduct.mockResolvedValue({ _id: 'mockProductId' });
    mockSaveAttachments.mockResolvedValue([]);

    const mockCreate = PurchaseOrder.create as jest.Mock;
    mockCreate.mockResolvedValue({
      _id: 'mockPO123',
      client: 'mockClientId',
      items: [
        { product: 'mockProductId', quantity: 2, rate: 50, amount: 100 },
      ],
      totalAmount: 100,
    });
    const result = await createPurchaseOrder(req);

    expect(result).toHaveProperty('client');
    expect(mockFindByIdClient).toHaveBeenCalledWith('mockClientId');
    expect(mockFindByIdProduct).toHaveBeenCalledWith('mockProductId');
  });

  it('throws error if client is not found', async () => {
    const req = {
      body: {
        clientId: 'invalidId',
        items: [],
        totalAmount: 0,
      },
    } as unknown as Request;

    mockFindByIdClient.mockResolvedValue(null);

    await expect(createPurchaseOrder(req)).rejects.toThrow('Client not found');
  });

  it('throws error if totalAmount does not match sum', async () => {
    const req = {
      body: {
        clientId: 'mockClientId',
        items: [
          {
            product: 'mockProductId',
            quantity: 2,
            rate: 10,
          },
        ],
        totalAmount: 100,
      },
    } as unknown as Request;


    mockFindByIdClient.mockResolvedValue({ _id: 'mockClientId' });
    mockFindByIdProduct.mockResolvedValue({ _id: 'mockProductId' });

    await expect(createPurchaseOrder(req)).rejects.toThrow('Total amount mismatch');
  });

  it('throws error if product is not found', async () => {
    const req = {
      body: {
        clientId: 'mockClientId',
        items: [
          {
            product: 'missingProductId',
            quantity: 1,
            rate: 10,
          },
        ],
        totalAmount: 10,
      },
    } as unknown as Request;

    mockFindByIdClient.mockResolvedValue({ _id: 'mockClientId' });
    mockFindByIdProduct.mockResolvedValue(null); // simulate missing product

    await expect(createPurchaseOrder(req)).rejects.toThrow('Product with ID missingProductId not found');
  });
});

describe('deletePurchaseOrder', () => {
  const mockFindByIdAndDelete = PurchaseOrder.findByIdAndDelete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the purchase order does not exist', async () => {
    mockFindByIdAndDelete.mockResolvedValue(null); // simulate not found

    await expect(deletePurchaseOrder('nonexistent-id')).rejects.toThrow(
        'Purchase Order not found'
    );
  });

  it('does not throw when purchase order is found and deleted', async () => {
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'mock-id' });

    await expect(deletePurchaseOrder('mock-id')).resolves.toBeUndefined();
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('mock-id');
  });
});

describe('updatePurchaseOrderStatus', () => {
  const mockFindPO = PurchaseOrder.findById as jest.Mock;
  const mockFindBills = Bill.find as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the purchase order is not found', async () => {
    mockFindPO.mockResolvedValue(null);

    await expect(updatePurchaseOrderStatus('invalid-id')).rejects.toThrow('Purchase Order not found');
  });

  it('returns null if there are no paid bills', async () => {
    mockFindPO.mockResolvedValue({ _id: 'po1' });
    mockFindBills.mockResolvedValue([]);

    const result = await updatePurchaseOrderStatus('po1');
    expect(result).toBeNull();
  });

  it('updates status to partially-received if some payment made', async () => {
    const saveMock = jest.fn();
    const po = {
      _id: 'po2',
      totalAmount: 100,
      status: 'open',
      totalBilled: 0,
      save: saveMock,
    };
    mockFindPO.mockResolvedValue(po);
    mockFindBills.mockResolvedValue([{ billAmount: 50 }]);

    const result = await updatePurchaseOrderStatus('po2');

    expect(po.totalBilled).toBe(50);
    expect(po.status).toBe('partially-received');
    expect(saveMock).toHaveBeenCalled();
    expect(result).toBe(po);
  });

  it('updates status to fulfilled if totalPaid >= totalAmount', async () => {
    const saveMock = jest.fn();
    const po = {
      _id: 'po3',
      totalAmount: 100,
      status: 'open',
      totalBilled: 0,
      save: saveMock,
    };
    mockFindPO.mockResolvedValue(po);
    mockFindBills.mockResolvedValue([{ billAmount: 100 }]);

    const result = await updatePurchaseOrderStatus('po3');

    expect(po.totalBilled).toBe(100);
    expect(po.status).toBe('fulfilled');
    expect(saveMock).toHaveBeenCalled();
    expect(result).toBe(po);
  });
});

describe('queryPurchaseOrders', () => {
  const mockPaginate = PurchaseOrder.paginate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns transformed paginated results', async () => {
    mockPaginate.mockResolvedValue({
      docs: [
        {
          _id: 'po1',
          vendor: { _id: 'v1' },
          clientId: 'c1',
          poNumber: 'PO123',
          totalAmount: 500,
          totalBilled: 200,
          status: 'open',
          createdBy: { _id: 'u1' },
          attachments: [{ _id: 'a1' }],
          shippingCost: 25,
          tax: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          items: [
            {
              _id: 'item1',
              product: { _id: 'prod1' },
              description: 'desc',
              quantity: 2,
              rate: 100,
              amount: 200,
            },
          ],
        },
      ],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalDocs: 1,
    });

    const result = await queryPurchaseOrders({}, { page: 1, limit: 10 });

    expect(result.docs).toHaveLength(1);
    expect(result.docs[0]).toMatchObject({
      id: 'po1',
      vendorId: 'v1',
      clientId: 'c1',
      totalAmount: 500,
      totalBilled: 200,
      status: 'open',
      createdBy: 'u1',
      attachments: ['a1'],
      shippingCost: 25,
      tax: 10,
    });

    expect(mockPaginate).toHaveBeenCalledWith({}, expect.objectContaining({
      page: 1,
      limit: 10,
      populate: expect.any(Array),
    }));
  });

  it('handles missing nested fields safely', async () => {
    mockPaginate.mockResolvedValue({
      docs: [
        {
          _id: 'po2',
          vendor: null,
          createdBy: null,
          attachments: null,
          clientId: 'c2',
          poNumber: 'PO456',
          totalAmount: 300,
          totalBilled: 0,
          status: 'open',
          shippingCost: 0,
          tax: 0,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-02T00:00:00Z',
          items: [
            {
              _id: 'item2',
              product: 'prod2', // no nested object
              description: 'desc2',
              quantity: 1,
              rate: 300,
              amount: 300,
            },
          ],
        },
      ],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalDocs: 1,
    });

    const result = await queryPurchaseOrders({}, { page: 1, limit: 10 });

    expect(result.docs[0].vendorId).toBe(null);
    expect(result.docs[0].createdBy).toBe(null);
    expect(result.docs[0].attachments).toEqual([]);
    expect(result.docs[0].items[0].product).toBe('prod2');
  });
});

describe('getPurchaseOrderById', () => {
  const mockFindById = PurchaseOrder.findById as jest.Mock;

  const createPopulateChain = (finalValue: any) => {
    const populate3 = jest.fn().mockReturnValue(Promise.resolve(finalValue));
    const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
    const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
    return { populate: populate1 };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the purchase order with populated fields', async () => {
    const mockPO = { _id: 'po1', vendor: {}, items: [], attachments: [] };
    mockFindById.mockReturnValue(createPopulateChain(mockPO));

    const result = await getPurchaseOrderById('po1');
    expect(result).toEqual(mockPO);
    expect(mockFindById).toHaveBeenCalledWith('po1');
  });

  it('returns null if the purchase order is not found', async () => {
    mockFindById.mockReturnValue(createPopulateChain(null));

    const result = await getPurchaseOrderById('nonexistent');
    expect(result).toBeNull();
    expect(mockFindById).toHaveBeenCalledWith('nonexistent');
  });
});

describe('updatePurchaseOrder', () => {
  const mockFindById = PurchaseOrder.findById as jest.Mock;
  const mockDeleteAttachments = deleteAttachments as jest.Mock;
  const mockSaveAttachments = attachmentService.saveAttachmentsFromRequest as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if items are an invalid JSON string', async () => {
    const req = {
      body: {
        items: '[invalid json',
      },
    } as unknown as Request;

    await expect(updatePurchaseOrder('po1', req)).rejects.toThrow('Invalid items format');
  });

  it('throws an error if the purchase order is not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = {
      body: {
        items: [],
      },
    } as unknown as Request;

    await expect(updatePurchaseOrder('nonexistent', req)).rejects.toThrow('Purchase Order not found');
  });

  it('removes deleted attachments and updates the PO', async () => {
    const po = {
      _id: 'po2',
      attachments: ['a1', 'a2', 'a3'],
      save: jest.fn(),
    };
    mockFindById.mockResolvedValue(po);
    mockDeleteAttachments.mockResolvedValue(undefined);
    mockSaveAttachments.mockResolvedValue([]);

    const req = {
      body: {
        deletedFiles: ['a2'],
        items: [],
      },
    } as unknown as Request;

    await updatePurchaseOrder('po2', req);

    expect(mockDeleteAttachments).toHaveBeenCalledWith(['a2']);
    expect(po.attachments).toEqual(['a1', 'a3']);
    expect(po.save).toHaveBeenCalled();
  });

  it('adds new attachments to the PO', async () => {
    const po = {
      _id: 'po3',
      attachments: ['a1'],
      save: jest.fn(),
    };
    mockFindById.mockResolvedValue(po);
    mockDeleteAttachments.mockResolvedValue(undefined);
    mockSaveAttachments.mockResolvedValue([{ _id: 'a4' }]);

    const req = {
      body: {
        deletedFiles: [],
        items: [],
      },
    } as unknown as Request;

    await updatePurchaseOrder('po3', req);

    expect(po.attachments).toEqual(['a1', 'a4']);
    expect(po.save).toHaveBeenCalled();
  });

  it('updates items and merges fields from body', async () => {
    const po = {
      _id: 'po4',
      attachments: [],
      items: [],
      notes: '',
      save: jest.fn(),
    };
    mockFindById.mockResolvedValue(po);
    mockDeleteAttachments.mockResolvedValue(undefined);
    mockSaveAttachments.mockResolvedValue([]);

    const req = {
      body: {
        deletedFiles: [],
        items: [
          { product: 'p1', quantity: 2, rate: 100, amount: 200 },
        ],
        notes: 'Updated PO',
      },
    } as unknown as Request;

    await updatePurchaseOrder('po4', req);

    expect(po.items).toEqual(req.body.items);
    expect(po.notes).toEqual('Updated PO');
    expect(po.save).toHaveBeenCalled();
  });
});