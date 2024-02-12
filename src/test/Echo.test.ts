import { EchoError } from '../errors/EchoError';
import { Echo } from '../modules/utils/Echo';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Echo', () => {
  describe('Echo.sleep', () => {
    it('should sleep for 100ms', async () => {
      const timestamp = Date.now();
      await Echo.sleep(100).then(() => {
        expect(Date.now() - timestamp > 100);
      });
    });

    it('should not sleep at all', async () => {
      const timestamp = Date.now();
      await Echo.sleep(0).then(() => {
        expect(Date.now() - timestamp > 0);
      });
    });
  });

  describe('Echo.retry', () => {
    test('job must be a function', async () => {
      await expect(Echo.retry('function' as any)).rejects.toBeInstanceOf(
        EchoError
      );
    });

    test('retry fails if the async job rejects every time', async () => {
      const job = jest.fn(() => Promise.reject(new Error('message')));
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );
      Echo.sleep = sleep;
      await expect(Echo.retry(job)).rejects.toMatchObject({
        message: 'message',
      });

      expect(sleep).toHaveBeenCalledTimes(3);
      expect(sleep).toHaveBeenCalledWith(500);
      expect(job).toHaveBeenCalledTimes(3);
      expect(job).toHaveBeenCalledWith();
    });

    test('retry fails if the sync job throws every time', async () => {
      const job = jest.fn(() => {
        throw new Error('message');
      });
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );
      Echo.sleep = sleep;
      await expect(Echo.retry(job)).rejects.toMatchObject({
        message: 'message',
      });

      expect(sleep).toHaveBeenCalledTimes(3);
      expect(sleep).toHaveBeenCalledWith(500);
      expect(job).toHaveBeenCalledTimes(3);
      expect(job).toHaveBeenCalledWith();
    });

    test('retry success if the async job resolves with a value', async () => {
      const job = jest.fn(() => Promise.resolve('value'));
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );
      Echo.sleep = sleep;
      await expect(Echo.retry(job)).resolves.toBe('value');

      expect(sleep).toHaveBeenCalledTimes(1);
      expect(sleep).toHaveBeenCalledWith(500);
      expect(job).toHaveBeenCalledTimes(1);
      expect(job).toHaveBeenCalledWith();
    });

    test('retry success if the sync job returns a value', async () => {
      const job = jest.fn(() => 'value');
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );
      Echo.sleep = sleep;
      await expect(Echo.retry(job)).resolves.toBe('value');

      expect(sleep).toHaveBeenCalledTimes(1);
      expect(sleep).toHaveBeenCalledWith(500);
      expect(job).toHaveBeenCalledTimes(1);
      expect(job).toHaveBeenCalledWith();
    });

    test('retry success after the second try', async () => {
      const job = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('message')))
        .mockImplementationOnce(() => Promise.resolve('value'));
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );
      Echo.sleep = sleep;
      await expect(Echo.retry(job)).resolves.toBe('value');

      expect(sleep).toHaveBeenCalledTimes(2);
      expect(sleep).toHaveBeenCalledWith(500);
      expect(job).toHaveBeenCalledTimes(2);
      expect(job).toHaveBeenCalledWith();
    });

    test('increase the delay by 500', async () => {
      const job = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('message')))
        .mockImplementationOnce(() => Promise.resolve('value'));
      const sleep = jest.fn(
        (delay: number): Promise<void> => Promise.resolve()
      );

      Echo.sleep = sleep;
      Echo.setExtraDelay(500);
      await expect(Echo.retry(job)).resolves.toBe('value');

      expect(sleep).toHaveBeenCalledTimes(2);
      expect(sleep).toHaveBeenNthCalledWith(1, 500);
      expect(sleep).toHaveBeenNthCalledWith(2, 1000);
      expect(job).toHaveBeenCalledTimes(2);
      expect(job).toHaveBeenCalledWith();
    });
  });

  describe('Echo Setters and Getters', () => {
    test('setMaxRetry and getMaxRetry should work correctly', () => {
      expect(() => Echo.setMaxRetry(0)).toThrow(
        `The 'Times' option must be an integer greater than 0`
      );

      Echo.setMaxRetry(5);
      expect(Echo.getMaxRetry()).toBe(5);
    });

    test('setRetryDelay and getRetryDelay should work correctly', () => {
      expect(() => Echo.setRetryDelay(-1)).toThrow(
        `The 'Delay' option must be an integer greater than 0`
      );
      Echo.setRetryDelay(500);
      expect(Echo.getRetryDelay()).toBe(500);
    });

    test('setExtraDelay and getExtraDelay should work correctly', () => {
      expect(() => Echo.setExtraDelay(-1)).toThrow(
        `The 'Increase' option must be an integer greater than or equal 0`
      );
      Echo.setExtraDelay(50);
      expect(Echo.getExtraDelay()).toBe(50);
    });
  });
});
