import { MemoryQ } from '../modules/utils/MemoryQ';

jest.useFakeTimers();

describe('MemoryQ.constructor', () => {
  test('throws error for invalid maxQueueTime', () => {
    expect(() => new MemoryQ(undefined, undefined)).toThrow(
      `The 'maxQueueTime' must be an integer greater than 0`
    );

    expect(() => new MemoryQ(0, undefined)).toThrow(
      `The 'maxQueueTime' must be an integer greater than 0`
    );
  });

  test('throws error for invalid maxQueueSize', () => {
    expect(() => new MemoryQ(1000, undefined)).toThrow(
      `The 'maxQueueSize' must be an integer greater than 0`
    );

    expect(() => new MemoryQ(1000, 0)).toThrow(
      `The 'maxQueueSize' must be an integer greater than 0`
    );
  });

  test('sets maxQueueTime and maxQueueSize correctly', () => {
    let Q = new MemoryQ(1000, 10);

    expect(Q.getMaxQueueTime()).toBe(1000); // 1s
    expect(Q.getMaxQueueSize()).toBe(10);

    Q = new MemoryQ(1000, Infinity);

    expect(Q.getMaxQueueTime()).toBe(1000); // 1s
    expect(Q.getMaxQueueSize()).toBe(Infinity);
  });
});

describe('MimoryQ.put', () => {
  test('jobs must be functions', () => {
    const Q = new MemoryQ(1000, 3);

    expect(() => Q.put(undefined)).toThrow(
      `The 'job' argument must be a function`
    );

    expect(() => Q.put('my job' as any)).toThrow(
      `The 'job' argument must be a function`
    );

    expect(() => Q.put(() => 'my job')).not.toThrow();
  });

  test('should put a job in the queue', () => {
    const Q = new MemoryQ(1000, 3);
    const $ = jest.spyOn(global, 'setTimeout');

    expect(Q.size()).toBe(0);

    Q.put(() => 'my job');

    expect(Q.size()).toBe(1);

    expect($).toBeCalledTimes(1);
    expect($).toBeCalledWith(expect.any(Function), 1000);

    $.mockRestore();
  });

  test('throws MaxSizeError on max queue size in the queue', () => {
    const Q = new MemoryQ(1000, 3);
    const $ = jest.spyOn(global, 'setTimeout');

    expect(() => {
      expect(Q.size()).toBe(0);

      Q.put(() => 'my job');
      Q.put(() => 'my job');
      Q.put(() => 'my job');

      expect(Q.size()).toBe(3);
      expect($).toBeCalledTimes(3);

      Q.put(() => 'my job'); // 4
    }).toThrow('Queue is full');

    expect(Q.size()).toBe(3);

    $.mockRestore();
  });

  test('emits QueueMaxSize on queue max size in the queue', () => {
    const Q = new MemoryQ(1000, 3);
    const $ = jest.spyOn(global, 'setTimeout');

    Q.on('QueueMaxSize', (job) => {
      expect(job()).toBe('queue is full');
    });

    expect(() => {
      Q.put(() => 'my job');
      Q.put(() => 'my job');
      Q.put(() => 'my job');
      Q.put(() => 'queue is full');
    }).toThrow('Queue is full');

    $.mockRestore();
  });

  test('throws MaxTimeError on max job time in the queue', () => {
    const Q = new MemoryQ(1000, 3);
    const $ = jest.spyOn(global, 'setTimeout');

    expect(() => {
      Q.put(() => 'my job');
      jest.advanceTimersByTime(1000);
    }).toThrow('Queue job has timed out');

    $.mockRestore();
  });

  test('emits maxQueueTime on max job time in the queue', () => {
    const Q = new MemoryQ(1000, 3);
    const $ = jest.spyOn(global, 'setTimeout');

    Q.on('maxQueueTime', (job) => {
      expect(job()).toBe('my job');
    });

    expect(() => {
      Q.put(() => 'my job');
      jest.advanceTimersByTime(1000);
    }).toThrow('Queue job has timed out');

    $.mockRestore();
  });
});

describe('MemoryQ.pull', () => {
  test('should pull a job from the queue', () => {
    const Q = new MemoryQ<string>(1000, 3);
    expect(Q.pull()).toBeNull();
    expect(Q.size()).toBe(0);

    Q.put(() => 'job');
    expect(Q.size()).toBe(1);

    const job = Q.pull();
    expect(job()).toBe('job');
    expect(Q.size()).toBe(0);
  });

  test('should pull the oldest job first', () => {
    const Q = new MemoryQ<string>(1000, 3);

    expect(Q.size()).toBe(0);

    Q.put(() => 'oldest');
    Q.put(() => 'newest');

    expect(Q.size()).toBe(2);

    const job = Q.pull();
    expect(job()).toBe('oldest');
    expect(Q.size()).toBe(1);
  });

  test('should pull all jobs from the queue', () => {
    const Q = new MemoryQ<string>(1000, 3);
    expect(Q.batch()).toBeNull();
    expect(Q.size()).toBe(0);

    // oldest
    const job1 = () => 'job 1';
    const job2 = () => 'job 2';
    const job3 = () => 'job 3';

    Q.put(job1);
    Q.put(job2);
    Q.put(job3);

    expect(Q.size()).toBe(3);

    const jobs = Q.batch();

    expect(jobs).toEqual([job1, job2, job3]);
    expect(Q.size()).toBe(0);
  });
});

test('returns the correct maxQueueTime', () => {
  expect(new MemoryQ(1000, 10).getMaxQueueTime()).toBe(1000); // 1s
});

test('returns the correct maxQueueSize', () => {
  expect(new MemoryQ(1000, 10).getMaxQueueSize()).toBe(10);
});

test('returns the queue length', () => {
  const Q = new MemoryQ(1000, 3);
  expect(Q.size()).toBe(0);

  Q.put(() => 'job');

  expect(Q.size()).toBe(1);
});

test('tells if the queue has a job', () => {
  const Q = new MemoryQ(1000, 3);
  expect(Q.hasJob()).toBe(false);

  Q.put(() => 'job');

  expect(Q.hasJob()).toBe(true);
});

test('tells if the queue has no job', () => {
  const Q = new MemoryQ(1000, 3);
  expect(Q.hasNoJob()).toBe(true);

  Q.put(() => 'job');

  expect(Q.hasNoJob()).toBe(false);
});
