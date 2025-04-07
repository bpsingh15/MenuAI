"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-[#F0E6D9]">
          <div className="relative flex-shrink-0">
            <Image
              src={item.image || "/placeholder.jpg"}
              alt={item.name}
              width={80}
              height={80}
              className="menu-item-image"
              priority={false}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[1rem] font-medium text-[#8B4513]">{item.name}</h3>
            <p className="text-[0.875rem] text-[#666666] mt-1 mb-2 line-height-[1.4]">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[0.875rem] font-medium text-[#8B4513]">
                ${item.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleAddItem(item)}
                className={`add-to-order-btn ${addedItems[item.id] ? "added" : ""}`}
              >
                <Plus className="w-4 h-4" />
                {addedItems[item.id] ? "Added" : "Add to Order"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

