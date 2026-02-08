export interface IQueueConsumer {
  connect(): Promise<void>
  disconnect(): Promise<void>

  subscribe<T = any>(
    exchange: string,
    queueName: string,
    callback: (message: T) => void
  ): Promise<void>
}
