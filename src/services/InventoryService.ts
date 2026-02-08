import { Order } from '../domain/entities/Order'

export class InventoryService {
  async execute(order: Order): Promise<void> {
    console.log(`[STOCK] Updating inventory for order: ${order.id}`)
  }
}
