"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategory } from "@/components/menu-category"
import { OrderSummary } from "@/components/order-summary"
import { CheckoutPage } from "@/components/checkout-page"
import { OrderSuccess } from "@/components/order-success"
import type { MenuItem, Order } from "@/types/restaurant"
import { menuData } from "@/data/menu-data"

type OrderState = "ordering" | "checkout" | "success"

interface RestaurantOrderingSystemProps {
  order: Order
  onAddItem: (item: MenuItem) => void
  onRemoveItem: (itemId: string) => void
  setOrder: React.Dispatch<React.SetStateAction<Order>>
}

export function RestaurantOrderingSystem({ order, onAddItem, onRemoveItem, setOrder }: RestaurantOrderingSystemProps) {
  const [orderState, setOrderState] = useState<OrderState>("ordering")
  const [activeTab, setActiveTab] = useState("appetizers")

  const handleCheckout = () => {
    setOrderState("checkout")
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

  if (orderState === "checkout") {
    return <CheckoutPage order={order} onBack={handleBackToOrder} onComplete={handleOrderComplete} />
  }

  if (orderState === "success") {
    return <OrderSuccess onNewOrder={handleNewOrder} />
  }

  return (
    <div className="grid grid-cols-[1fr_380px] gap-8 max-w-[1400px] mx-auto p-8">
      <div className="menu-section">
        <div className="mb-6">
          <h1 className="text-[#8B4513] text-2xl font-semibold mb-2">Menu</h1>
          <p className="text-[#666666] text-sm">Select items to add to your order</p>
        </div>
        
        <Tabs defaultValue="appetizers" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#FFF8EC] p-1 rounded-lg mb-6">
            <TabsTrigger 
              value="appetizers"
              className="px-4 py-2 rounded data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
            >
              Appetizers
            </TabsTrigger>
            <TabsTrigger 
              value="mains"
              className="px-4 py-2 rounded data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
            >
              Main Courses
            </TabsTrigger>
            <TabsTrigger 
              value="sides"
              className="px-4 py-2 rounded data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
            >
              Sides
            </TabsTrigger>
            <TabsTrigger 
              value="desserts"
              className="px-4 py-2 rounded data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
            >
              Desserts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appetizers">
            <MenuCategory items={menuData.appetizers} onAddItem={onAddItem} />
          </TabsContent>
          <TabsContent value="mains">
            <MenuCategory items={menuData.mains} onAddItem={onAddItem} />
          </TabsContent>
          <TabsContent value="sides">
            <MenuCategory items={menuData.sides} onAddItem={onAddItem} />
          </TabsContent>
          <TabsContent value="desserts">
            <MenuCategory items={menuData.desserts} onAddItem={onAddItem} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="order-summary-section">
        <OrderSummary
          order={order}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}

