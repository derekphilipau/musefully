import * as readline from 'readline';

import { ask, askYesNo, info, warn } from '@/lib/command';

jest.mock('readline', () => {
  const mockClose = jest.fn();
  const mockQuestion = jest.fn();

  return {
    createInterface: jest.fn().mockReturnValue({
      question: mockQuestion,
      close: mockClose,
    }),
  };
});

describe('CLI functions', () => {
  let mockQuestion, mockClose;

  beforeEach(() => {
    mockQuestion = readline.createInterface({}).question;
    mockClose = readline.createInterface({}).close;
  });

  test('ask function', async () => {
    mockQuestion.mockImplementation((question, callback) => {
      callback('Test Input');
    });
    const response = await ask('Test question?');
    expect(response).toBe('Test Input');
  });

  test('askYesNo function (yes)', async () => {
    mockQuestion.mockImplementation((question, callback) => {
      callback('yes');
    });
    const response = await askYesNo('Continue?');
    expect(response).toBe(true);
  });

  test('askYesNo function (no)', async () => {
    mockQuestion.mockImplementation((question, callback) => {
      callback('no');
    });
    const response = await askYesNo('Continue?');
    expect(response).toBe(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
