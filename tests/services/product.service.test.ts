import {
  createProduct,
  queryProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../../src/services/product.service';

import { Client, Vendor, Product } from '../../src/models';

jest.mock('../../src/models/client.model');
jest.mock('../../src/models/vendor.model');
jest.mock('../../src/models/product.model');

describe('createProduct', () => {
  const mockFindClient = Client.findById as jest.Mock;
  const mockFindVendor = Vendor.findById as jest.Mock;
  const mockCreateProduct = Product.create as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('creates product if client and vendor exist', async () => {
    const input = {
      name: 'Widget',
      description: 'Basic widget',
      vendorId: 'v123',
      clientId: 'c123',
    };
    mockFindClient.mockResolvedValue({ _id: 'c123' });
    mockFindVendor.mockResolvedValue({ _id: 'v123' });
    mockCreateProduct.mockResolvedValue({ _id: 'p1', ...input });

    const result = await createProduct(input);
    expect(result).toHaveProperty('_id', 'p1');
    expect(mockCreateProduct).toHaveBeenCalledWith(input);
  });

  it('throws if client not found', async () => {
    mockFindClient.mockResolvedValue(null);
    await expect(
        createProduct({ name: 'x', description: '', clientId: 'cX', vendorId: 'vX' })
    ).rejects.toThrow('Client not found');
  });

  it('throws if vendor not found', async () => {
    mockFindClient.mockResolvedValue({});
    mockFindVendor.mockResolvedValue(null);
    await expect(
        createProduct({ name: 'x', description: '', clientId: 'cX', vendorId: 'vX' })
    ).rejects.toThrow('Vendor not found');
  });
});

describe('queryProducts', () => {
  const mockPaginate = Product.paginate as jest.Mock;
  beforeEach(() => jest.clearAllMocks());

  it('applies filters and paginates', async () => {
    mockPaginate.mockResolvedValue({ docs: [], total: 0 });
    const result = await queryProducts({ name: 'widget' }, { page: 1, limit: 10 });
    expect(mockPaginate).toHaveBeenCalledWith(
        expect.objectContaining({ name: expect.any(Object) }),
        expect.objectContaining({ page: 1, limit: 10 })
    );
    expect(result).toHaveProperty('docs');
  });
});

describe('getProductById', () => {
  const mockFind = Product.findById as jest.Mock;

  it('returns product when found', async () => {
    mockFind.mockResolvedValue({ _id: 'p1' });
    const result = await getProductById('p1');
    expect(result).toHaveProperty('_id', 'p1');
  });

  it('returns null when not found', async () => {
    mockFind.mockResolvedValue(null);
    const result = await getProductById('notfound');
    expect(result).toBeNull();
  });
});

describe('updateProduct', () => {
  const mockFind = Product.findById as jest.Mock;

  it('updates product fields and saves', async () => {
    const save = jest.fn();
    const mockProduct = { _id: 'p1', name: 'Old', save };
    mockFind.mockResolvedValue(mockProduct);
    const result = await updateProduct('p1', { name: 'New' });
    expect(result.name).toBe('New');
    expect(save).toHaveBeenCalled();
  });

  it('throws if product not found', async () => {
    mockFind.mockResolvedValue(null);
    await expect(updateProduct('bad', { name: 'x' })).rejects.toThrow('Product not found');
  });
});

describe('deleteProduct', () => {
  const mockDelete = Product.findByIdAndDelete as jest.Mock;

  it('deletes and returns product', async () => {
    mockDelete.mockResolvedValue({ _id: 'pDel' });
    const result = await deleteProduct('pDel');
    expect(result).toHaveProperty('_id', 'pDel');
  });

  it('throws if product not found', async () => {
    mockDelete.mockResolvedValue(null);
    await expect(deleteProduct('bad')).rejects.toThrow('Product not found');
  });
});
