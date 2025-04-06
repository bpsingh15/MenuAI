export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface OrderItem {
  item: MenuItem
  quantity: number
}

export interface Order {
  items: OrderItem[]
  total: number
}

