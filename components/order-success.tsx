"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface OrderSuccessProps {
  onNewOrder: () => void
}

export function OrderSuccess({ onNewOrder }: OrderSuccessProps) {
  // Generate a random order number
  const orderNumber = `#${Math.floor(10000 + Math.random() * 90000)}`

  return (
    <Card className="border-green-200 bg-white shadow-md max-w-md mx-auto">
      <CardHeader className="bg-green-100 rounded-t-lg text-center">
        <div className="flex justify-center mb-2">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <CardTitle className="text-green-900 text-2xl">Order Confirmed!</CardTitle>
        <CardDescription>Your order has been successfully placed</CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground">Order Number</p>
            <p className="text-xl font-bold">{orderNumber}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <p className="font-medium text-green-800">Thank you for your order!</p>
            <p className="text-sm text-green-700 mt-1">
              Your food will be ready for pickup in approximately 20-30 minutes.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>A confirmation email has been sent to your email address.</p>
            <p>You can show your order number when you arrive at the restaurant.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center p-6">
        <Button onClick={onNewOrder} className="bg-amber-600 hover:bg-amber-700">
          Place Another Order
        </Button>
      </CardFooter>
    </Card>
  )
}

