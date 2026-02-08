import { rabbitMQConfig } from '../config/rabbitmq'
import { Order } from '../domain/entities/Order'
import { IQueueProvider } from '../domain/queue/IQueueProvider'
import { loggerEvents } from '../infra/shared/LogEventEmitter'

export class OrderService {
  // Injection
  constructor(private readonly queueProvider: IQueueProvider) {}

  async execute(
    customer: string,
    items: string[],
    total: number
  ): Promise<Order> {
    // Mock order creation logic
    const order: Order = {
      id: Math.random().toString(36).substring(2, 15),
      customer,
      items,
      total,
      status: 'pending',
      createdAt: new Date()
    }

    try {
      // Publish order to RabbitMQ
      await this.queueProvider.publishInExchange<Order>(
        rabbitMQConfig.exchange,
        '', // <--- Fanount
        order
      )

      loggerEvents.emit(
        'info',
        `Order ${order.id} created and published to exchange ${rabbitMQConfig.exchange}`
      )

      return order
    } catch (error) {
      order.status = 'failed'
      loggerEvents.emit('error', `Failed to process order ${order.id}`, error)

      throw new Error('ORDER_FAILED')
    }
  }
}
