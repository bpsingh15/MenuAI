import { RestaurantOrderingSystem } from "../components/restaurant-ordering-system"

export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <section style={{ padding: '1.5rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>
            Welcome to Gourmet Delights
          </h1>
          <p style={{ maxWidth: '42rem', color: 'var(--muted-foreground)' }}>
            Experience culinary excellence with our carefully crafted dishes. Order now and let our AI assistant help you create the perfect meal.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#menu" className="btn btn-primary">
              View Menu
            </a>
            <a href="#order" className="btn btn-outline">
              Start Order
            </a>
          </div>
        </div>
      </section>
      <section id="menu" style={{ padding: '2rem 0' }}>
        <div style={{ maxWidth: '58rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>
            Our Menu
          </h2>
          <p style={{ maxWidth: '85%', color: 'var(--muted-foreground)' }}>
            Explore our diverse selection of dishes, from appetizers to desserts.
          </p>
        </div>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <RestaurantOrderingSystem />
        </div>
      </section>
    </div>
  )
}

