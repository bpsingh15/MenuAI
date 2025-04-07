import type { MenuItem } from "@/types/restaurant"

// Sample menu data with real images
export const menuData: Record<string, MenuItem[]> = {
  appetizers: [
    {
      id: "app1",
      name: "Bruschetta",
      description: "Toasted bread topped with tomatoes, garlic, and basil",
      price: 8,
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app2",
      name: "Mozzarella Sticks",
      description: "Breaded and fried mozzarella with marinara sauce",
      price: 9,
      image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app3",
      name: "Spinach Artichoke Dip",
      description: "Creamy dip with spinach, artichokes, and cheese",
      price: 10,
      image: "https://images.unsplash.com/photo-1576506542790-51244b486a6b?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app4",
      name: "Calamari",
      description: "Lightly fried squid with lemon aioli",
      price: 12,
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "app5",
      name: "Chicken Wings",
      description: "Crispy wings with choice of sauce",
      price: 11,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=200&auto=format&fit=crop",
    },
  ],
  mains: [
    {
      id: "main1",
      name: "Grilled Salmon",
      description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
      price: 22,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main2",
      name: "Chicken Parmesan",
      description: "Breaded chicken with marinara sauce and mozzarella",
      price: 18,
      image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main3",
      name: "Ribeye Steak",
      description: "12oz ribeye with garlic butter and mashed potatoes",
      price: 28,
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main4",
      name: "Vegetable Pasta",
      description: "Fettuccine with seasonal vegetables in white wine sauce",
      price: 16,
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "main5",
      name: "Mushroom Risotto",
      description: "Creamy arborio rice with wild mushrooms and parmesan",
      price: 17,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=200&auto=format&fit=crop",
    },
  ],
  sides: [
    {
      id: "side1",
      name: "Garlic Mashed Potatoes",
      description: "Creamy potatoes with roasted garlic",
      price: 6,
      image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side2",
      name: "Grilled Vegetables",
      description: "Seasonal vegetables with balsamic glaze",
      price: 7,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side3",
      name: "Caesar Salad",
      description: "Romaine lettuce with caesar dressing and croutons",
      price: 8,
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side4",
      name: "French Fries",
      description: "Crispy fries with sea salt",
      price: 5,
      image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "side5",
      name: "Steamed Rice",
      description: "Fluffy jasmine rice",
      price: 4,
      image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=200&auto=format&fit=crop",
    },
  ],
  desserts: [
    {
      id: "dessert1",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with ganache",
      price: 8,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "dessert2",
      name: "Cheesecake",
      description: "New York style with berry compote",
      price: 9,
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "dessert3",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 8,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=200&auto=format&fit=crop",
    },
  ],
} 