import { rabbitMQConfig } from './config/rabbitmq'
import { Order } from './domain/entities/Order'
import { IQueueConsumer } from './domain/queue/IQueueConsumer'
import { RabbitMQConsumer } from './infra/queue/QueueConsumer'
import { InventoryService } from './services/InventoryService'
import { NotificationService } from './services/NotificationService'
import { PaymentService } from './services/PaymentService'

async function bootstrap() {
  const consumer: IQueueConsumer = new RabbitMQConsumer(rabbitMQConfig.url)
  await consumer.connect()

  // Services
  const notificationService = new NotificationService()
  const paymentService = new PaymentService()
  const inventoryService = new InventoryService()

  // Queues
  consumer.subscribe<Order>(
    rabbitMQConfig.exchange,
    'notification_queue',
    (order: Order) => {
      notificationService.execute(order)
    }
  )

  consumer.subscribe<Order>(
    rabbitMQConfig.exchange,
    'payment_queue',
    (order: Order) => {
      paymentService.execute(order)
    }
  )

  consumer.subscribe<Order>(
    rabbitMQConfig.exchange,
    'inventory_queue',
    (order: Order) => {
      inventoryService.execute(order)
    }
  )

  console.log(
    `[INFO] [${new Date().toISOString()}] All services are subscribed to the exchange '${rabbitMQConfig.exchange}'`
  )
}

bootstrap().catch(console.error)
