import axios from 'axios';
import FormData from 'form-data';
import { extractPdf } from '../../src/services/filereader.service';
import httpStatus from 'http-status';
import ApiError from '../../src/utils/ApiError';

jest.mock('axios');

describe('extractPdf', () => {
  const mockedAxiosPost = axios.post as jest.Mock;

  const dummyBuffer = Buffer.from('fake-pdf-content');
  const dummyFilename = 'test.pdf';

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, FILEREADER_URL: 'http://mock-filereader' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sends a PDF and returns parsed result', async () => {
    const mockResult = { text: 'parsed text', metadata: { pages: 1 } };
    mockedAxiosPost.mockResolvedValue({ data: mockResult });

    const result = await extractPdf(dummyBuffer, dummyFilename);
    expect(result).toEqual(mockResult);
    expect(mockedAxiosPost).toHaveBeenCalledWith(
        'http://mock-filereader/extract',
        expect.any(Object), // the FormData body
        expect.objectContaining({
          headers: expect.objectContaining({
            'content-type': expect.stringMatching(/^multipart\/form-data; boundary=/),
          }),
        })
    );
  });

  it('throws an error if FILEREADER_URL is not set', async () => {
    delete process.env.FILEREADER_URL;

    await expect(extractPdf(dummyBuffer, dummyFilename))
        .rejects.toThrow('FileReader service URL not configured');
  });

  it('throws an error if the external service fails', async () => {
    mockedAxiosPost.mockRejectedValue({
      response: { data: 'Invalid PDF' },
    });

    await expect(extractPdf(dummyBuffer, dummyFilename))
        .rejects.toThrow('Error extracting PDF: Invalid PDF');
  });
});
