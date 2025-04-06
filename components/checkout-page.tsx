"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Banknote, Wallet } from "lucide-react"
import type { Order } from "@/types/restaurant"

interface CheckoutPageProps {
  order: Order
  onBack: () => void
  onComplete: () => void
}

export function CheckoutPage({ order, onBack, onComplete }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "wallet">("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onComplete()
    }, 2000)
  }

  // Calculate tax and total
  const tax = order.total * 0.08 // 8% tax
  const total = order.total + tax

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-amber-200 bg-white shadow-md">
        <CardHeader className="bg-amber-100 rounded-t-lg">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-2 text-amber-900 hover:text-amber-700 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="text-amber-900">Checkout</CardTitle>
          </div>
          <CardDescription>Complete your order</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Method</h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "card" | "cash" | "wallet")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-amber-50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-amber-50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center cursor-pointer">
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-amber-50">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center cursor-pointer">
                    <Wallet className="h-4 w-4 mr-2" />
                    Digital Wallet
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="space-y-4 border rounded-md p-4 bg-amber-50">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-white shadow-md">
        <CardHeader className="bg-amber-100 rounded-t-lg">
          <CardTitle className="text-amber-900">Order Summary</CardTitle>
          <CardDescription>Review your order before payment</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">{item.quantity}x </span>
                    {item.item.name}
                  </div>
                  <div>${(item.item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-amber-50 p-4 text-sm text-muted-foreground">
          <p>Your order will be ready for pickup in approximately 20-30 minutes after payment is confirmed.</p>
        </CardFooter>
      </Card>
    </div>
  )
}

