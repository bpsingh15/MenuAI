"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { Order } from "@/types/restaurant"

interface OrderSummaryProps {
  order: Order
  onAddItem: (item: any) => void
  onRemoveItem: (itemId: string) => void
}

export function OrderSummary({ order, onAddItem, onRemoveItem }: OrderSummaryProps) {
  if (order.items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">Your order is empty. Add some items from the menu.</div>
    )
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {order.items.map((orderItem) => (
          <div key={orderItem.item.id} className="flex items-center gap-3 border-b border-amber-100 pb-3">
            <div className="h-12 w-12 relative rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={orderItem.item.image || "/placeholder.svg"}
                alt={orderItem.item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{orderItem.item.name}</h4>
              <p className="text-sm text-muted-foreground">${orderItem.item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onRemoveItem(orderItem.item.id)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center">{orderItem.quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAddItem(orderItem.item)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

