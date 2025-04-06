import { RestaurantOrderingSystem } from "@/components/restaurant-ordering-system"

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900">Gourmet Delights Restaurant</h1>
          <p className="mt-2 text-lg text-amber-700">Order delicious food and get personalized recommendations</p>
        </div>
        <RestaurantOrderingSystem />
      </div>
    </main>
  )
}

