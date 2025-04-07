"use client"

import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { Order } from "@/types/restaurant"

interface OrderSummaryProps {
  order: Order
  onAddItem: (item: any) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
}

export function OrderSummary({ order, onAddItem, onRemoveItem, onCheckout }: OrderSummaryProps) {
  if (order.items.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-[#F0E6D9]">
        <h2 className="text-2xl font-semibold text-[#8B4513] mb-2">Your Order</h2>
        <p className="text-[#666666] mb-4">Add items from the menu to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-[#F0E6D9]">
      <h2 className="text-2xl font-semibold text-[#8B4513] mb-2">Your Order</h2>
      <p className="text-[#666666] mb-6">Review and manage your order</p>
      
      <div className="space-y-4">
        {order.items.map((orderItem) => (
          <div key={orderItem.item.id} className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Image
                src={orderItem.item.image || "/placeholder.jpg"}
                alt={orderItem.item.name}
                width={64}
                height={64}
                className="order-item-image"
                priority={false}
                loading="lazy"
              />
            </div>
            <div className="order-item-details">
              <h4>{orderItem.item.name}</h4>
              <p>${orderItem.item.price.toFixed(2)} each</p>
            </div>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => onRemoveItem(orderItem.item.id)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="quantity-display">{orderItem.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => onAddItem(orderItem.item)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="checkout-section">
        <div className="subtotal">
          <span className="subtotal-label">Subtotal:</span>
          <span className="subtotal-amount">${order.total.toFixed(2)}</span>
        </div>
        
        <p className="checkout-note">
          Taxes and fees calculated at checkout
        </p>
        
        <button
          className="checkout-button"
          onClick={onCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}

