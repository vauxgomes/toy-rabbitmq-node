export interface IQueueProvider {
  connect(): Promise<void>
  disconnect(): Promise<void>;
  
  publishInExchange(
    exchange: string,
    routingKey: string,
    message: any
  ): Promise<boolean>

  // https://www.rabbitmq.com/docs/exchanges#types
  setupExchange?(
    exchange: string,
    type: 'fanout' | 'direct' | 'topic'
  ): Promise<void>

  
}
