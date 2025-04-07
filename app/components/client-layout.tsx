"use client"

import React, { useState } from "react"
import { AIAssistant } from "@/components/ai-assistant"
import { GetAIAssistanceButton } from "@/components/get-ai-assistance-button"
import { menuData } from "@/data/menu-data"
import type { Order, MenuItem } from "@/types/restaurant"
import { RestaurantOrderingSystem } from "@/components/restaurant-ordering-system"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [order, setOrder] = useState<Order>({ items: [], total: 0 })

  const handleAIAssistantToggle = () => {
    setShowAIAssistant((prev) => !prev)
  }

  const handleAddItem = (item: MenuItem) => {
    setOrder((prevOrder) => {
      const existingItem = prevOrder.items.find((orderItem) => orderItem.item.id === item.id)

      if (existingItem) {
        const updatedItems = prevOrder.items.map((orderItem) =>
          orderItem.item.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      } else {
        const updatedItems = [...prevOrder.items, { item, quantity: 1 }]
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      }
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setOrder((prevOrder) => {
      const existingItem = prevOrder.items.find((orderItem) => orderItem.item.id === itemId)

      if (!existingItem) return prevOrder

      if (existingItem.quantity === 1) {
        const updatedItems = prevOrder.items.filter((orderItem) => orderItem.item.id !== itemId)
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      } else {
        const updatedItems = prevOrder.items.map((orderItem) =>
          orderItem.item.id === itemId
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        )
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      }
    })
  }

  const calculateTotal = (items: Order['items']) => {
    return items.reduce((total, item) => total + (item.item.price * item.quantity), 0)
  }

  return (
    <div className={`relative min-h-screen flex flex-col ${showAIAssistant ? 'pb-[600px]' : ''}`}>
      {children}
      
      <main className="flex-1 menu-container">
        <RestaurantOrderingSystem
          order={order}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          setOrder={setOrder}
        />
      </main>
      
      {/* Fixed position buttons */}
      <div className="fixed-buttons">
        <GetAIAssistanceButton onClick={handleAIAssistantToggle} />
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <div className="ai-assistant-container visible">
          <AIAssistant
            order={order}
            onClose={() => setShowAIAssistant(false)}
            menuData={menuData}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      )}
    </div>
  )
} 