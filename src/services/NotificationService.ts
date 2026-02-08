import { Order } from "../domain/entities/Order";

export class NotificationService {
  async execute(order: Order): Promise<void> {
    console.log(`[MAIL] Sending order confirmation: ${order?.id}`)
  }
}
