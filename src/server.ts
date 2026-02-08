import express from 'express'

import { rabbitMQConfig } from './config/rabbitmq'
import { RabbitMQProvider } from './infra/queue/RabbitMQProvider'
import { OrderService } from './services/OrderService'

// App
const app = express()
app.use(express.json())

// RabbitMQ Provider
const provider = new RabbitMQProvider(rabbitMQConfig.url)

async function bootstrap() {
  // RabbitMQ setup
  await provider.connect()
  await provider.setupExchange(rabbitMQConfig.exchange, 'fanout')

  // Services
  const orderService = new OrderService(provider)

  // Routes
  app.post('/orders', async (req, res) => {
    const { customer, items, total } = req.body

    try {
      const order = await orderService.execute(customer, items, total)
      res.status(201).json(order)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })

  app.listen(3000, () => console.log('Server running on port 3000'))
}

bootstrap()
