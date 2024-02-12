import { EchoError } from '../../errors/EchoError';
import { Test } from '../utils/Test';

type Job<T> = () => T | Promise<T>;

export const Echo = {
  maxRetry: 3,

  retryDelay: 500,

  extraDelay: 0,

  retry: jest.fn((job: Job<any>): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!Test.isFunction(job)) {
        return reject(new EchoError('The job must be a function'));
      }

      const task = (): Promise<any> => {
        return new Promise((resolve) => resolve(job()));
      };

      let retryDelay = Echo.retryDelay;

      const executor = (maxRetry: number = 1) => {
        Echo.sleep(retryDelay).then(() => {
          task()
            .then((result) => resolve(result))
            .catch((error) => {
              if (maxRetry < Echo.maxRetry) {
                retryDelay += Echo.extraDelay;
                executor((maxRetry += 1));
              } else return reject(error);
            });
        });
      };

      executor();
    });
  }),

  sleep(retryDelay: number): Promise<void> {
    return Promise.resolve();
  },

  setMaxRetry(maxRetry: number) {
    if (!Test.isInteger(maxRetry) || !Test.isGreaterThan(maxRetry, 0)) {
      throw new EchoError(
        `The 'maxRetry' option must be an integer greater than 0`
      );
    }

    Echo.maxRetry = maxRetry;
  },

  setRetryDelay(retryDelay: number) {
    if (
      !Test.isInteger(retryDelay) ||
      !Test.isGreaterThanOrEqual(retryDelay, 0)
    ) {
      throw new EchoError(
        `The 'retryDelay' option must be an integer greater than 0`
      );
    }

    Echo.retryDelay = retryDelay;
  },

  setExtraDelay(extraDelay: number) {
    if (
      !Test.isInteger(extraDelay) ||
      !Test.isGreaterThanOrEqual(extraDelay, 0)
    ) {
      throw new EchoError(
        `The 'extraDelay' option must be an integer greater than or equal 0`
      );
    }

    Echo.extraDelay = extraDelay;
  },

  getMaxRetry(): number {
    return Echo.maxRetry;
  },

  getRetryDelay(): number {
    return Echo.retryDelay;
  },

  getExtraDelay(): number {
    return Echo.extraDelay;
  },
};
