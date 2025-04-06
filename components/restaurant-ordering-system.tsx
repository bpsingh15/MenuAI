"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategory } from "@/components/menu-category"
import { OrderSummary } from "@/components/order-summary"
import { AIAssistant } from "@/components/ai-assistant"
import { CheckoutPage } from "@/components/checkout-page"
import { OrderSuccess } from "@/components/order-success"
import { MessageSquareText } from "lucide-react"
import type { MenuItem, Order, OrderItem } from "@/types/restaurant"

// Sample menu data with real images
const menuData: Record<string, MenuItem[]> = {
  appetizers: [
    {
      id: "app1",
      name: "Bruschetta",
      description: "Toasted bread topped with tomatoes, garlic, and basil",
      price: 8,
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app2",
      name: "Mozzarella Sticks",
      description: "Breaded and fried mozzarella with marinara sauce",
      price: 9,
      image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app3",
      name: "Spinach Artichoke Dip",
      description: "Creamy dip with spinach, artichokes, and cheese",
      price: 10,
      image: "https://images.unsplash.com/photo-1576506542790-51244b486a6b?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app4",
      name: "Calamari",
      description: "Lightly fried squid with lemon aioli",
      price: 12,
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app5",
      name: "Chicken Wings",
      description: "Crispy wings with choice of sauce",
      price: 11,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=200&auto=format&fit=crop",
    },
  ],
  mains: [
    {
      id: "main1",
      name: "Grilled Salmon",
      description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
      price: 22,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main2",
      name: "Chicken Parmesan",
      description: "Breaded chicken with marinara sauce and mozzarella",
      price: 18,
      image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main3",
      name: "Ribeye Steak",
      description: "12oz ribeye with garlic butter and mashed potatoes",
      price: 28,
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main4",
      name: "Vegetable Pasta",
      description: "Fettuccine with seasonal vegetables in white wine sauce",
      price: 16,
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main5",
      name: "Mushroom Risotto",
      description: "Creamy arborio rice with wild mushrooms and parmesan",
      price: 17,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=200&auto=format&fit=crop",
    },
  ],
  sides: [
    {
      id: "side1",
      name: "Garlic Mashed Potatoes",
      description: "Creamy potatoes with roasted garlic",
      price: 6,
      image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side2",
      name: "Grilled Vegetables",
      description: "Seasonal vegetables with balsamic glaze",
      price: 7,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side3",
      name: "Caesar Salad",
      description: "Romaine lettuce with caesar dressing and croutons",
      price: 8,
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side4",
      name: "French Fries",
      description: "Crispy fries with sea salt",
      price: 5,
      image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side5",
      name: "Steamed Rice",
      description: "Fluffy jasmine rice",
      price: 4,
      image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=200&auto=format&fit=crop",
    },
  ],
  desserts: [
    {
      id: "dessert1",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with ganache",
      price: 8,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "dessert2",
      name: "Cheesecake",
      description: "New York style with berry compote",
      price: 9,
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "dessert3",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 8,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=200&auto=format&fit=crop",
    },
  ],
}

type OrderState = "ordering" | "checkout" | "success"

export function RestaurantOrderingSystem() {
  const [order, setOrder] = useState<Order>({ items: [], total: 0 })
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [orderState, setOrderState] = useState<OrderState>("ordering")

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((acc, item) => acc + item.item.price * item.quantity, 0)
  }

  const addItem = (item: MenuItem) => {
    const existingItem = order.items.find((orderItem) => orderItem.item.id === item.id)

    if (existingItem) {
      const updatedItems = order.items.map((orderItem) =>
        orderItem.item.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem,
      )
      setOrder({ items: updatedItems, total: calculateTotal(updatedItems) })
    } else {
      const updatedItems = [...order.items, { item, quantity: 1 }]
      setOrder({ items: updatedItems, total: calculateTotal(updatedItems) })
    }
  }

  const removeItem = (itemId: string) => {
    const existingItem = order.items.find((orderItem) => orderItem.item.id === itemId)

    if (!existingItem) return

    if (existingItem.quantity === 1) {
      const updatedItems = order.items.filter((orderItem) => orderItem.item.id !== itemId)
      setOrder({ items: updatedItems, total: calculateTotal(updatedItems) })
    } else {
      const updatedItems = order.items.map((orderItem) =>
        orderItem.item.id === itemId ? { ...orderItem, quantity: orderItem.quantity - 1 } : orderItem,
      )
      setOrder({ items: updatedItems, total: calculateTotal(updatedItems) })
    }
  }

  const handleCheckout = () => {
    setOrderState("checkout")
    setIsAssistantOpen(false)
  }

  const handleBackToOrder = () => {
    setOrderState("ordering")
  }

  const handleOrderComplete = () => {
    setOrderState("success")
  }

  const handleNewOrder = () => {
    setOrder({ items: [], total: 0 })
    setOrderState("ordering")
  }

  // Render different views based on order state
  if (orderState === "checkout") {
    return <CheckoutPage order={order} onBack={handleBackToOrder} onComplete={handleOrderComplete} />
  }

  if (orderState === "success") {
    return <OrderSuccess onNewOrder={handleNewOrder} />
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-amber-200 bg-white shadow-md">
        <CardHeader className="bg-amber-100 rounded-t-lg">
          <CardTitle className="text-amber-900">Menu</CardTitle>
          <CardDescription>Select items to add to your order</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="appetizers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
              <TabsTrigger value="mains">Main Courses</TabsTrigger>
              <TabsTrigger value="sides">Sides</TabsTrigger>
              <TabsTrigger value="desserts">Desserts</TabsTrigger>
            </TabsList>
            <TabsContent value="appetizers">
              <MenuCategory items={menuData.appetizers} onAddItem={addItem} />
            </TabsContent>
            <TabsContent value="mains">
              <MenuCategory items={menuData.mains} onAddItem={addItem} />
            </TabsContent>
            <TabsContent value="sides">
              <MenuCategory items={menuData.sides} onAddItem={addItem} />
            </TabsContent>
            <TabsContent value="desserts">
              <MenuCategory items={menuData.desserts} onAddItem={addItem} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-white shadow-md">
        <CardHeader className="bg-amber-100 rounded-t-lg">
          <CardTitle className="text-amber-900">Your Order</CardTitle>
          <CardDescription>Review and manage your order</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <OrderSummary order={order} onAddItem={addItem} onRemoveItem={removeItem} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-amber-100 p-4">
          <div className="space-y-1">
            <div className="text-right font-medium">Subtotal: ${order.total.toFixed(2)}</div>
            <div className="text-right text-sm text-muted-foreground">Taxes and fees calculated at checkout</div>
          </div>
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={handleCheckout}
            disabled={order.items.length === 0}
          >
            Checkout
          </Button>
          <Button
            variant="outline"
            className="w-full border-amber-200 hover:bg-amber-50 hover:text-amber-900"
            onClick={() => setIsAssistantOpen(true)}
            disabled={order.items.length === 0}
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Get AI Assistance
          </Button>
        </CardFooter>
      </Card>

      {isAssistantOpen && (
        <AIAssistant
          order={order}
          onClose={() => setIsAssistantOpen(false)}
          menuData={menuData}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      )}
    </div>
  )
}

