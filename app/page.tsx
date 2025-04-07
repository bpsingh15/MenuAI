import { RestaurantOrderingSystem } from "../components/restaurant-ordering-system"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="restaurant-header">
        <h1>Gourmet Delights Restaurant</h1>
        <p>Order delicious food and get personalized recommendations</p>
      </div>
      
      <main className="menu-container">
        <RestaurantOrderingSystem />
      </main>
    </div>
  )
}

