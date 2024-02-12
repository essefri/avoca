import { EchoError } from '../../errors/EchoError';
import { Test } from './Test';

type Job<T> = () => T | Promise<T>;

/**
 * @class Echo
 * @property maxRetry: the max number of retries
 * @property retyrDelay: the number of miliseconds between each retry
 * @property extraDelay: the number of miliseconds to add after each retry
 */
export class Echo {
  /**
   * The max number of retries
   * @type integer should be greater than 0
   */
  private static maxRetry: number = 3;

  /**
   * The number of miliseconds between each retry
   * @type integer should be greater than 0
   */
  private static retryDelay: number = 500;

  /**
   * The number of miliseconds to add after each retry
   * @type integer should be greater than or euqles to 0
   */
  private static extraDelay: number = 0;

  /**
   * Retries the given job the number of times specified
   * @param job The function to execute and retry
   * @returns Promise resolves with the job's return value or rejects with the caught error
   */
  public static retry<T>(job: Job<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!Test.isFunction(job)) {
        return reject(new EchoError('The job must be a function'));
      }

      // resolves if the job returns a value or resolves
      // rejects if the job throws an error or rejects
      const task = (): Promise<T> => {
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
  }

  /**
   * Delay execution the specified number of miliseconds
   * @param retryDelay The number of miliseconds to delay execution
   * @returns Promise always resolves with void after the given number of miliseconds pass
   */
  public static sleep(retryDelay: number): Promise<void> {
    return new Promise((resolve) => {
      if (retryDelay === 0) return resolve();
      setTimeout(() => resolve(), retryDelay);
    });
  }

  /**
   * Update the setMaxRetry property value
   * @param maxRetry The max number of retries
   * @returns void
   */
  public static setMaxRetry(maxRetry: number) {
    if (!Test.isInteger(maxRetry) || !Test.isGreaterThan(maxRetry, 0)) {
      throw new EchoError(
        `The 'maxRetry' option must be an integer greater than 0`
      );
    }

    Echo.maxRetry = maxRetry;
  }

  /**
   * Update the retryDelay property value
   * @param retryDelay The number of miliseconds between each retry
   * @returns void
   */
  public static setRetryDelay(retryDelay: number) {
    if (
      !Test.isInteger(retryDelay) ||
      !Test.isGreaterThanOrEqual(retryDelay, 0)
    ) {
      throw new EchoError(
        `The 'retryDelay' option must be an integer greater than 0`
      );
    }

    Echo.retryDelay = retryDelay;
  }

  /**
   * Update the extraDelay property value
   * @param extraDelay The number of miliseconds to add after each retry
   * @returns void
   */
  public static setExtraDelay(extraDelay: number) {
    if (
      !Test.isInteger(extraDelay) ||
      !Test.isGreaterThanOrEqual(extraDelay, 0)
    ) {
      throw new EchoError(
        `The 'extraDelay' option must be an integer greater than or equal 0`
      );
    }

    Echo.extraDelay = extraDelay;
  }

  /**
   * Returns the maxRetry property value
   */
  public static getMaxRetry(): number {
    return Echo.maxRetry;
  }

  /**
   * Returns the retryDelay property value
   */
  public static getRetryDelay(): number {
    return Echo.retryDelay;
  }

  /**
   * Returns the extraDelay property value
   */
  public static getExtraDelay(): number {
    return Echo.extraDelay;
  }
}
