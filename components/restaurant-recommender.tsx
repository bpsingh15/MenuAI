"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, DollarSign, Utensils, AlertTriangle, ThumbsUp } from "lucide-react"

// Sample dishes with portion sizes (in arbitrary "portion units")
const menuItems = {
  appetizers: [
    { id: "app1", name: "Bruschetta", portionSize: 0.5, price: 8 },
    { id: "app2", name: "Mozzarella Sticks", portionSize: 0.7, price: 9 },
    { id: "app3", name: "Spinach Dip", portionSize: 0.8, price: 10 },
    { id: "app4", name: "Calamari", portionSize: 0.6, price: 12 },
    { id: "app5", name: "Chicken Wings", portionSize: 0.8, price: 11 },
  ],
  mains: [
    { id: "main1", name: "Grilled Salmon", portionSize: 1.0, price: 22 },
    { id: "main2", name: "Chicken Parmesan", portionSize: 1.2, price: 18 },
    { id: "main3", name: "Ribeye Steak", portionSize: 1.3, price: 28 },
    { id: "main4", name: "Vegetable Pasta", portionSize: 1.1, price: 16 },
    { id: "main5", name: "Mushroom Risotto", portionSize: 1.0, price: 17 },
  ],
  sides: [
    { id: "side1", name: "Garlic Mashed Potatoes", portionSize: 0.4, price: 6 },
    { id: "side2", name: "Grilled Vegetables", portionSize: 0.3, price: 7 },
    { id: "side3", name: "Caesar Salad", portionSize: 0.4, price: 8 },
    { id: "side4", name: "French Fries", portionSize: 0.5, price: 5 },
    { id: "side5", name: "Steamed Rice", portionSize: 0.3, price: 4 },
  ],
}

const formSchema = z.object({
  guests: z.coerce.number().min(1, "At least 1 guest required").max(50, "Maximum 50 guests"),
  budget: z.coerce.number().min(10, "Minimum budget is $10").max(10000, "Maximum budget is $10,000"),
  selectedItems: z.record(z.number().min(0).max(20)),
})

type MenuItem = {
  id: string
  name: string
  portionSize: number
  price: number
}

type FeedbackResult = {
  totalPortions: number
  recommendedPortions: number
  status: "too-little" | "just-right" | "too-much"
  totalCost: number
  isOverBudget: boolean
  selectedItems: Record<string, number>
}

export function RestaurantRecommender() {
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"appetizers" | "mains" | "sides">("appetizers")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: 4,
      budget: 200,
      selectedItems: {},
    },
  })

  // Get all menu items in a flat structure for easier access
  const allMenuItems = [...menuItems.appetizers, ...menuItems.mains, ...menuItems.sides]

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { guests, budget, selectedItems } = values

    // Calculate total portions and cost
    let totalPortions = 0
    let totalCost = 0

    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const item = allMenuItems.find((item) => item.id === itemId)
        if (item) {
          totalPortions += item.portionSize * quantity
          totalCost += item.price * quantity
        }
      }
    })

    // Recommended portions based on number of guests
    // Assuming each person needs about 1.8 portion units for a satisfying meal
    const recommendedPortions = guests * 1.8

    // Determine if the amount of food is appropriate
    let status: "too-little" | "just-right" | "too-much"

    if (totalPortions < recommendedPortions * 0.8) {
      status = "too-little"
    } else if (totalPortions > recommendedPortions * 1.2) {
      status = "too-much"
    } else {
      status = "just-right"
    }

    setFeedback({
      totalPortions,
      recommendedPortions,
      status,
      totalCost,
      isOverBudget: totalCost > budget,
      selectedItems,
    })
  }

  // Helper to get the quantity of a specific item
  const getItemQuantity = (itemId: string) => {
    return form.watch(`selectedItems.${itemId}`) || 0
  }

  // Helper to set the quantity of a specific item
  const setItemQuantity = (itemId: string, quantity: number) => {
    form.setValue(`selectedItems.${itemId}`, quantity)
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="border-amber-200 bg-white shadow-md">
        <CardHeader className="bg-amber-100 rounded-t-lg">
          <CardTitle className="text-amber-900">Select Your Dishes</CardTitle>
          <CardDescription>Choose dishes and quantities for your party</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Number of Guests
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Total Budget ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("appetizers")}
                    className={`flex-1 py-2 px-4 text-center ${
                      selectedCategory === "appetizers"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    Appetizers
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("mains")}
                    className={`flex-1 py-2 px-4 text-center ${
                      selectedCategory === "mains"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    Main Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("sides")}
                    className={`flex-1 py-2 px-4 text-center ${
                      selectedCategory === "sides"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    Sides
                  </button>
                </div>

                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  <h3 className="font-medium mb-3">
                    {selectedCategory === "appetizers"
                      ? "Appetizers"
                      : selectedCategory === "mains"
                        ? "Main Courses"
                        : "Side Dishes"}
                  </h3>
                  <div className="space-y-3">
                    {menuItems[selectedCategory].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border-b">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">${item.price}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQty = getItemQuantity(item.id)
                              if (currentQty > 0) {
                                setItemQuantity(item.id, currentQty - 1)
                              }
                            }}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{getItemQuantity(item.id)}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQty = getItemQuantity(item.id)
                              setItemQuantity(item.id, currentQty + 1)
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="font-medium mb-2">Your Selections:</h3>
                  <div className="flex flex-wrap gap-2 min-h-[50px]">
                    {Object.entries(form.watch("selectedItems") || {}).map(([itemId, quantity]) => {
                      if (quantity > 0) {
                        const item = allMenuItems.find((item) => item.id === itemId)
                        if (item) {
                          return (
                            <Badge key={itemId} variant="outline" className="bg-amber-50">
                              {quantity}x {item.name}
                            </Badge>
                          )
                        }
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                Check My Selection
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {feedback && (
        <Card className="border-amber-200 bg-white shadow-md">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-amber-900">Your Food Feedback</CardTitle>
            <CardDescription>
              Based on {form.getValues().guests} guests with ${form.getValues().budget} budget
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert
                variant={
                  feedback.status === "too-little"
                    ? "destructive"
                    : feedback.status === "too-much"
                      ? "destructive"
                      : "default"
                }
              >
                {feedback.status === "too-little" && <AlertTriangle className="h-4 w-4" />}
                {feedback.status === "too-much" && <AlertTriangle className="h-4 w-4" />}
                {feedback.status === "just-right" && <ThumbsUp className="h-4 w-4" />}
                <AlertTitle>
                  {feedback.status === "too-little" && "Not Enough Food"}
                  {feedback.status === "too-much" && "Too Much Food"}
                  {feedback.status === "just-right" && "Perfect Amount"}
                </AlertTitle>
                <AlertDescription>
                  {feedback.status === "too-little" &&
                    `You've selected dishes that provide about ${feedback.totalPortions.toFixed(1)} portions, but we recommend about ${feedback.recommendedPortions.toFixed(1)} portions for ${form.getValues().guests} guests.`}
                  {feedback.status === "too-much" &&
                    `You've selected dishes that provide about ${feedback.totalPortions.toFixed(1)} portions, which is more than the recommended ${feedback.recommendedPortions.toFixed(1)} portions for ${form.getValues().guests} guests.`}
                  {feedback.status === "just-right" &&
                    `You've selected a good amount of food! Your selection provides about ${feedback.totalPortions.toFixed(1)} portions, which is close to the recommended ${feedback.recommendedPortions.toFixed(1)} portions for ${form.getValues().guests} guests.`}
                </AlertDescription>
              </Alert>

              {feedback.isOverBudget && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Over Budget</AlertTitle>
                  <AlertDescription>
                    Your selection costs ${feedback.totalCost.toFixed(2)}, which exceeds your budget of $
                    {form.getValues().budget}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4">
                <h3 className="font-medium mb-2">Your Selected Items:</h3>
                <div className="space-y-2">
                  {Object.entries(feedback.selectedItems).map(([itemId, quantity]) => {
                    if (quantity > 0) {
                      const item = allMenuItems.find((item) => item.id === itemId)
                      if (item) {
                        return (
                          <div key={itemId} className="flex justify-between items-center p-2 border-b">
                            <span>
                              {quantity}x {item.name}
                            </span>
                            <span>${(item.price * quantity).toFixed(2)}</span>
                          </div>
                        )
                      }
                    }
                    return null
                  })}
                </div>
                <div className="flex justify-between items-center p-2 mt-2 font-bold">
                  <span>Total</span>
                  <span>${feedback.totalCost.toFixed(2)}</span>
                </div>
              </div>

              {feedback.status === "too-little" && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-medium mb-2">Suggestions:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Add more main courses for a substantial meal</li>
                    <li>Consider adding shared appetizers</li>
                    <li>Add side dishes to complement your mains</li>
                  </ul>
                </div>
              )}

              {feedback.status === "too-much" && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-medium mb-2">Suggestions:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reduce the number of appetizers</li>
                    <li>Consider sharing main courses</li>
                    <li>Reduce side dishes if you have many appetizers</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-amber-100 pt-4">
            <div className="flex items-center text-amber-700">
              <Utensils className="mr-2 h-5 w-5" />
              <span>Enjoy your meal!</span>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

