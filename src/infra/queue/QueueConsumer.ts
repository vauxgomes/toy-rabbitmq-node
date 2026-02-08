import * as amqp from 'amqplib'

import { IQueueConsumer } from '../../domain/queue/IQueueConsumer'
import { loggerEvents } from '../shared/LogEventEmitter'

export class RabbitMQConsumer implements IQueueConsumer {
  private connection!: any // Set as 'any' -> Buggy! -> amqp.Connection
  private channel!: amqp.Channel

  // Constructor
  constructor(private readonly uri: string) {}

  /**
   * Connects to RabbitMQ and creates a channel
   * Emits logs on success or failure
   */
  async connect(): Promise<void> {
    this.connection = await (amqp.connect(this.uri) as any)
    this.channel = await this.connection.createChannel()

    loggerEvents.emit('info', 'Consumer connected to RabbitMQ')
  }

  /**
   * Subscribes to a queue bound to an exchange and processes messages with a callback
   *
   * @param exchange Exchange name
   * @param queueName Queue name to consume from
   * @param callback callback function to process received messages
   */
  async subscribe<T = any>(
    exchange: string,
    queueName: string,
    callback: (payload: T) => void
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized')

    // Make sure exchange and queue exist, then bind them
    await this.channel.assertExchange(exchange, 'fanout', { durable: true })
    await this.channel.assertQueue(queueName, { durable: true })
    await this.channel.bindQueue(queueName, exchange, '')

    // Start consuming messages
    this.channel.consume(queueName, (payload) => {
      if (payload) {
        try {
          // Payload parsing and callback execution
          const content = JSON.parse(payload.content.toString())
          callback(content)

          // Success
          this.channel?.ack(payload)
        } catch (err) {
          loggerEvents.emit(
            'error',
            `Error processing message from ${queueName}`,
            err
          )

          // TODO nacking
          // this.channel?.nack(msg, false, false);
        }
      }
    })

    loggerEvents.emit('info', `Subscribed to queue: ${queueName}`)
  }

  /**
   * Closes the connection to RabbitMQ
   */
  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close()
    if (this.connection) await this.connection.close()
  }
}
