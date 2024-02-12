import { _MegaConfigurationOptions } from '../modules/mega/types/_MegaConfigurationOptions';

const configuration: _MegaConfigurationOptions = {
  default: 'main',
  connections: {
    main: {
      driver: 'MySQL',
      user: 'root',
      password: 'simo',
      database: 'simo',
      host: 'localhost',
      port: 3306,
      charset: undefined,
      timezone: 'local',
      multipleStatements: false,
      ssl: undefined,
      maxConnections: 10,
      maxIdleTime: 60000,
      shouldQueue: true,
      maxQueueSize: Infinity,
      maxQueueTime: 1000,
      shouldRetry: true,
      maxRetry: 3,
      retryDelay: 500,
      extraDelay: 500,
    },
  },
};

export default configuration;
