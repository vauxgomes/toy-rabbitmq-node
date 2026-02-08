import * as amqp from 'amqplib'

import { IQueueProvider } from '../../domain/queue/IQueueProvider'
import { loggerEvents } from '../shared/LogEventEmitter'

export class RabbitMQProvider implements IQueueProvider {
  private connection!: any // Set as 'any' -> Buggy! -> amqp.Connection
  private channel!: amqp.Channel

  // Constructor
  constructor(private readonly uri: string) {}

  /**
   * Connects to RabbitMQ and creates a channel
   * Emits logs on success or failure
   */
  async connect(): Promise<void> {
    try {
      // NOTE: Connection cast forced to any to bypass type issues with amqplib
      this.connection = await (amqp.connect(this.uri) as any)
      this.channel = await this.connection.createChannel()

      loggerEvents.emit('info', 'RabbitMQ connected successfully')
    } catch (error) {
      loggerEvents.emit('error', 'Failed to connect to RabbitMQ', error)
    }
  }

  /**
   * Sets up an exchange in RabbitMQ
   * NOTE: If the exchange already exists, it will be reused.
   *
   * @param exchange Exchange name
   * @param type Type of exchange (fanout, direct, topic), default is fanout
   */
  async setupExchange(
    exchange: string,
    type: 'fanout' | 'topic' | 'direct' = 'fanout'
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized')
    }

    await this.channel.assertExchange(exchange, type, {
      durable: true
    })
  }

  /**
   * Publishes a message to a specified exchange with a routing key
   *
   * @param exchange Exchange name
   * @param routingKey Key used for routing (NOTE: ignored in fanout exchanges)
   * @param message Message payload (NOTE: will be stringified to JSON)
   * @returns
   */
  async publishInExchange<T = any>(
    exchange: string,
    routingKey: string,
    message: T
  ): Promise<boolean> {
    if (!this.channel) throw new Error('Channel not initialized')

    const success = this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message))
    )

    if (success) {
      // 'queue_published' was defined in LogEventEmitter
      loggerEvents.emit('queue_published', exchange, message)
    }

    return success
  }

  /**
   * Closes the connection to RabbitMQ
   */
  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close()
    if (this.connection) await this.connection.close()
    loggerEvents.emit('info', 'RabbitMQ connections closed')
  }
}
