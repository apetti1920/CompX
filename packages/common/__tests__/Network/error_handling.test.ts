import { CompXError } from '../../src/Helpers/ErrorHandling';
import { CompXErrorJson, isCompXErrorJson } from '../../src/Network/ErrorHandling';

describe('Error Handling Tests', () => {
  test('Does Construct', () => {
    const err = new CompXError('error', 'test', 'test error');
    expect(err).toBeInstanceOf(CompXError);
  });

  test('Adding an error to the stack', () => {
    const err1 = new CompXError('error', 'test', 'test error');
    const err2 = new CompXError('error', 'test2', 'test2 error');

    err1.AddToStack(err2);
    expect(err1.name).toBe('test2');
  });

  test('Create an error from json', () => {
    const err: CompXErrorJson = {
      errorType: 'error',
      name: 'test2',
      message: 'test2 err',
      stack: {
        errorType: 'error',
        name: 'test',
        message: 'test err'
      }
    };
    const error = CompXError.fromJSON(err);
    expect(error.name).toBe('test2');
    expect(error.ToJson()).toStrictEqual(err);
  });

  test('Is Error Json good', () => {
    const d = {
      errorType: 'error',
      name: 'test2',
      message: 'test2 err',
      stack: {
        errorType: 'error',
        name: 'test',
        message: 'test err'
      }
    };
    expect(isCompXErrorJson(d)).toBeTruthy();
  });

  test('Is error json bad', () => {
    const d0a = 'test';
    expect(isCompXErrorJson(d0a)).not.toBeTruthy();

    const d1 = { errorType: 'test', name: 'test2', message: 'test2 err' };
    expect(isCompXErrorJson(d1)).not.toBeTruthy();

    const d2 = { errorType: 'error', name: 1, message: 'test2 err' };
    expect(isCompXErrorJson(d2)).not.toBeTruthy();

    const d3 = { errorType: 'error', name: 'test2', message: 1 };
    expect(isCompXErrorJson(d3)).not.toBeTruthy();

    const d4 = {
      errorType: 'error',
      name: 'test2',
      message: 'test2 err',
      stack: {
        errorType: 'test',
        name: 'test2',
        message: 'test2 err'
      }
    };
    expect(isCompXErrorJson(d4)).not.toBeTruthy();
  });
});
