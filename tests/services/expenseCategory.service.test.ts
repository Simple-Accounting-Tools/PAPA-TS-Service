import {
  createExpenseCategory,
  queryExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory
} from '../../src/services/expenseCategory.service';

import { ExpenseCategory } from '../../src/models';
import httpStatus from 'http-status';

jest.mock('../../src/models/expenseCategory.model');

describe('createExpenseCategory', () => {
  const mockFindOne = ExpenseCategory.findOne as jest.Mock;
  const mockCreate = ExpenseCategory.create as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('creates a new category if name is unique', async () => {
    const input = { name: 'Travel', description: 'Flights, hotels' };
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'id1', ...input });

    const result = await createExpenseCategory(input);

    expect(result).toHaveProperty('_id', 'id1');
    expect(mockCreate).toHaveBeenCalledWith(input);
  });

  it('throws if name already exists', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existing' });

    await expect(
        createExpenseCategory({ name: 'Duplicate', description: '' })
    ).rejects.toThrow('Expense category with this name already exists.');
  });
});

describe('queryExpenseCategories', () => {
  const mockPaginate = ExpenseCategory.paginate as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('queries with no filter', async () => {
    mockPaginate.mockResolvedValue({ docs: [], totalDocs: 0 });

    const result = await queryExpenseCategories({}, { page: 1, limit: 10 });
    expect(result).toHaveProperty('docs');
    expect(mockPaginate).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
  });

  it('applies name regex filter', async () => {
    mockPaginate.mockResolvedValue({ docs: [], totalDocs: 0 });

    await queryExpenseCategories({ name: 'Travel' }, { page: 1, limit: 10 });
    expect(mockPaginate).toHaveBeenCalledWith(
        { name: { $regex: expect.any(RegExp) } },
        expect.objectContaining({ page: 1, limit: 10 })
    );
  });
});

describe('getExpenseCategoryById', () => {
  const mockFindById = ExpenseCategory.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('returns a category if found', async () => {
    const mockCat = { _id: 'cat1', name: 'Food' };
    mockFindById.mockResolvedValue(mockCat);

    const result = await getExpenseCategoryById('cat1');
    expect(result).toBe(mockCat);
  });

  it('throws if category not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(getExpenseCategoryById('bad')).rejects.toThrow('Expense category not found');
  });
});

describe('updateExpenseCategory', () => {
  const mockFindById = ExpenseCategory.findById as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('updates fields if found', async () => {
    const save = jest.fn().mockResolvedValue({ _id: 'cat1', name: 'Updated' });
    const cat = { _id: 'cat1', name: 'Old', save };
    mockFindById.mockResolvedValue(cat);

    const result = await updateExpenseCategory('cat1', { name: 'Updated' });

    expect(save).toHaveBeenCalled();
    expect(result).toHaveProperty('name', 'Updated');
  });

  it('throws if not found', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(updateExpenseCategory('bad', {})).rejects.toThrow('Expense category not found');
  });
});

describe('deleteExpenseCategory', () => {
  const mockDelete = ExpenseCategory.findByIdAndDelete as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('deletes if found', async () => {
    mockDelete.mockResolvedValue({ _id: 'cat1' });
    await expect(deleteExpenseCategory('cat1')).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith('cat1');
  });

  it('throws if not found', async () => {
    mockDelete.mockResolvedValue(null);
    await expect(deleteExpenseCategory('bad')).rejects.toThrow('Expense category not found');
  });
});
