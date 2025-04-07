import { ClientLayout } from "./components/client-layout"

export default function Home() {
  return (
    <ClientLayout>
      <div className="restaurant-header">
        <h1>Gourmet Delights Restaurant</h1>
        <p>Order delicious food and get personalized recommendations</p>
      </div>
    </ClientLayout>
  )
}

