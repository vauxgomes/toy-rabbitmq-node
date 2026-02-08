export interface Order {
  id: string
  customer: string
  items: string[]
  total: number
  status: 'pending' | 'processed' | 'failed'
  createdAt: Date
}
