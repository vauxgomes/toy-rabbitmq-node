import { Order } from '../domain/entities/Order'

export class PaymentService {
  async execute(order: Order): Promise<void> {
    console.log(`[PAYMENT] Processing payment for order: ${order.id}`)
  }
}
