export interface _MegaPoolOptions {
  maxConnections?: number; // max number of connections to create
  maxIdleTime?: number; // life time of idle connections
  shouldQueue?: boolean; // should we queue connection requests in case no idle connection available
  maxQueueSize?: number; // max number of connection requests to queue
  maxQueueTime?: number; // max time a connection request can be queued
  shouldRetry?: boolean; // should retry the
  maxRetry?: number;
  retryDelay?: number;
  extraDelay?: number;
}
