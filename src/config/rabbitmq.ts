export const rabbitMQConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'order_events'
  // queue: process.env.RABBITMQ_QUEUE || 'default_queue' // Saved for later
}
