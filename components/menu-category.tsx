"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Plus, Check } from "lucide-react"
import Image from "next/image"
import type { MenuItem } from "@/types/restaurant"

interface MenuCategoryProps {
  items: MenuItem[]
  onAddItem: (item: MenuItem) => void
}

export function MenuCategory({ items, onAddItem }: MenuCategoryProps) {
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({})

  const handleAddItem = (item: MenuItem) => {
    // Set the animation state
    setAddedItems((prev) => ({ ...prev, [item.id]: true }))

    // Add the item to the cart
    onAddItem(item)

    // Reset the animation state after animation completes
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }))
    }, 1500)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col border-amber-100 overflow-hidden">
          <div className="flex p-4 gap-4">
            <div className="h-20 w-20 relative rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">{item.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              <p className="font-medium mt-1">${item.price.toFixed(2)}</p>
            </div>
          </div>
          <CardFooter className="p-2 pt-0 mt-auto">
            <Button
              onClick={() => handleAddItem(item)}
              variant="outline"
              className={`w-full border-amber-200 transition-all duration-500 ${
                addedItems[item.id]
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "hover:bg-amber-50 hover:text-amber-900"
              }`}
              disabled={addedItems[item.id]}
            >
              {addedItems[item.id] ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span className="animate-fadeIn">Added to Order</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Order
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

