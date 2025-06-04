import fs from 'fs';
import path from 'path';
import * as attachmentService from '../../src/services/attachment.service';
import { Attachment } from '../../src/models/attachment.model';

jest.mock('../../src/models/attachment.model');
jest.mock('fs');

describe('AttachmentService', () => {
  it('returns empty array if no files are passed', async () => {
    const req: any = { files: [] };
    const result = await attachmentService.saveAttachmentsFromRequest(req);
    expect(result).toEqual([]);
  });

  describe('deleteAttachments', () => {
    const mockFindById = Attachment.findById as jest.Mock;
    const unlinkMock = fs.unlinkSync as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('removes files using the relative path', async () => {
      const deleteOne = jest.fn();
      mockFindById.mockResolvedValue({ path: '/uploads/images/test.png', deleteOne });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await attachmentService.deleteAttachments(['fileId']);

      const uploadsDir = path.resolve(process.cwd(), 'src/uploads');
      const expectedPath = path.join(uploadsDir, 'images/test.png');

      expect(unlinkMock).toHaveBeenCalledWith(expectedPath);
      expect(deleteOne).toHaveBeenCalled();
    });

    it('skips when attachment is missing', async () => {
      mockFindById.mockResolvedValue(null);

      await attachmentService.deleteAttachments(['missingId']);

      expect(unlinkMock).not.toHaveBeenCalled();
    });
  });
});
