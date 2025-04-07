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
  const [activeTab, setActiveTab] = useState("appetizers")

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
    <>
      <div className="menu-section">
        <h2>Menu</h2>
        <p>Select items to add to your order</p>
        
        <div className="menu-tabs">
          <button
            className={`menu-tab ${activeTab === "appetizers" ? "active" : ""}`}
            onClick={() => setActiveTab("appetizers")}
          >
            Appetizers
          </button>
          <button
            className={`menu-tab ${activeTab === "mains" ? "active" : ""}`}
            onClick={() => setActiveTab("mains")}
          >
            Main Courses
          </button>
          <button
            className={`menu-tab ${activeTab === "sides" ? "active" : ""}`}
            onClick={() => setActiveTab("sides")}
          >
            Sides
          </button>
          <button
            className={`menu-tab ${activeTab === "desserts" ? "active" : ""}`}
            onClick={() => setActiveTab("desserts")}
          >
            Desserts
          </button>
        </div>

        <div className="menu-items">
          {menuData[activeTab].map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.image} alt={item.name} />
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
              <button className="add-to-order" onClick={() => addItem(item)}>
                Add to Order
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="order-summary">
        <h2>Your Order</h2>
        <p>Review and manage your order</p>
        
        {order.items.map((orderItem) => (
          <div key={orderItem.item.id} className="order-item">
            <img src={orderItem.item.image} alt={orderItem.item.name} />
            <div className="order-item-content">
              <h3>{orderItem.item.name}</h3>
              <p>${orderItem.item.price.toFixed(2)} each</p>
            </div>
            <div className="quantity-controls">
              <button className="quantity-btn" onClick={() => removeItem(orderItem.item.id)}>-</button>
              <span>{orderItem.quantity}</span>
              <button className="quantity-btn" onClick={() => addItem(orderItem.item)}>+</button>
            </div>
          </div>
        ))}

        <div className="subtotal">
          <span>Subtotal:</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      {isAssistantOpen && (
        <div className="ai-assistant">
          <div className="ai-assistant-header">
            <h3>
              <MessageSquareText className="w-5 h-5" />
              AI Food Assistant
            </h3>
            <button onClick={() => setIsAssistantOpen(false)}>×</button>
          </div>
          <AIAssistant 
            order={order} 
            onClose={() => setIsAssistantOpen(false)}
            menuData={menuData}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        </div>
      )}

      {!isAssistantOpen && (
        <button
          className="fixed bottom-6 right-6 bg-accent text-white p-4 rounded-full shadow-lg flex items-center gap-2"
          onClick={() => setIsAssistantOpen(true)}
        >
          <MessageSquareText className="w-5 h-5" />
          <span>Get AI Assistance</span>
        </button>
      )}
    </>
  )
}

