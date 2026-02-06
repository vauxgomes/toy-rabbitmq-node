/**
 * References:
 * - Type Safety: https://danilafe.com/blog/typescript_typesafe_events/
 */

import { EventEmitter } from 'node:events'

// Biding event names to their argument types for type safety
type LogEvents = {
  info: [message: string, context?: any]
  warning: [message: string, context?: any]
  error: [message: string, error: any]

  // Custom event for when a message is published to RabbitMQ
  queue_published: [exchange: string, payload: any]
}

class LogEventEmitter extends EventEmitter {
  // Type Safety
  override emit<K extends keyof LogEvents>(
    event: K,
    ...args: LogEvents[K]
  ): boolean {
    return super.emit(event, ...args)
  }

  // Type Safety
  override on<K extends keyof LogEvents>(
    event: K,
    listener: (...args: LogEvents[K]) => void
  ): this {
    return super.on(event, listener)
  }
}

// Publisher
export const loggerEvents = new LogEventEmitter()

// Subscribers
loggerEvents.on('info', (msg, ctx) => {
  console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ctx || '')
})

loggerEvents.on('warning', (msg, ctx) => {
  console.warn(`[WARNING] [${new Date().toISOString()}] ${msg}`, ctx || '')
})

loggerEvents.on('error', (msg, err) => {
  console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, err)
})

loggerEvents.on('queue_published', (exchange, payload) => {
  console.log(`[RABBITMQ] Message sent to exchange: ${exchange}`)
})
