import * as attachmentService from '../../src/services/attachment.service';

describe('AttachmentService', () => {
  it('returns empty array if no files are passed', async () => {
    const req: any = { files: [] };
    const result = await attachmentService.saveAttachmentsFromRequest(req);
    expect(result).toEqual([]);
  });
});
