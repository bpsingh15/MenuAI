export type AllergenInfo = {
  gluten: boolean
  dairy: boolean
  nuts: boolean
  shellfish: boolean
  soy: boolean
  eggs: boolean
}

export type DietaryInfo = {
  vegetarian: boolean
  vegan: boolean
  keto: boolean
  halal: boolean
  kosher: boolean
}

export type FoodInfo = {
  id: string
  ingredients: string[]
  allergens: AllergenInfo
  dietary: DietaryInfo
}

export const foodInformation: Record<string, FoodInfo> = {
  // Appetizers
  app1: {
    id: "app1",
    ingredients: ["Toasted bread", "Fresh tomatoes", "Garlic", "Basil", "Olive oil", "Balsamic glaze"],
    allergens: {
      gluten: true,
      dairy: false,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: true,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  app2: {
    id: "app2",
    ingredients: ["Mozzarella cheese", "Breadcrumbs", "Eggs", "Flour", "Italian herbs", "Marinara sauce"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: false,
    },
  },
  app3: {
    id: "app3",
    ingredients: [
      "Spinach",
      "Artichoke hearts",
      "Cream cheese",
      "Sour cream",
      "Parmesan cheese",
      "Garlic",
      "Mayonnaise",
      "Pine nuts",
    ],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: true,
      shellfish: false,
      soy: true,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: true,
      halal: true,
      kosher: false,
    },
  },
  app4: {
    id: "app4",
    ingredients: ["Squid", "Flour", "Cornmeal", "Salt", "Pepper", "Lemon aioli", "Eggs"],
    allergens: {
      gluten: true,
      dairy: false,
      nuts: false,
      shellfish: true,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: false,
      halal: false,
      kosher: false,
    },
  },
  app5: {
    id: "app5",
    ingredients: ["Chicken wings", "Buffalo sauce", "Butter", "Garlic", "Spices"],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: true,
      halal: false,
      kosher: false,
    },
  },

  // Main Courses
  main1: {
    id: "main1",
    ingredients: ["Fresh salmon", "Lemon", "Butter", "Herbs", "Seasonal vegetables"],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: true,
      halal: true,
      kosher: true,
    },
  },
  main2: {
    id: "main2",
    ingredients: [
      "Chicken breast",
      "Breadcrumbs",
      "Eggs",
      "Flour",
      "Marinara sauce",
      "Mozzarella cheese",
      "Parmesan cheese",
    ],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: false,
      halal: true,
      kosher: false,
    },
  },
  main3: {
    id: "main3",
    ingredients: ["Ribeye steak", "Garlic butter", "Salt", "Pepper", "Herbs"],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: true,
      halal: false,
      kosher: false,
    },
  },
  main4: {
    id: "main4",
    ingredients: ["Fettuccine pasta", "Seasonal vegetables", "White wine", "Garlic", "Olive oil", "Parmesan cheese"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  main5: {
    id: "main5",
    ingredients: [
      "Arborio rice",
      "Wild mushrooms",
      "Vegetable broth",
      "White wine",
      "Parmesan cheese",
      "Butter",
      "Onions",
      "Garlic",
    ],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },

  // Sides
  side1: {
    id: "side1",
    ingredients: ["Potatoes", "Garlic", "Butter", "Cream", "Salt", "Pepper"],
    allergens: {
      gluten: false,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  side2: {
    id: "side2",
    ingredients: ["Zucchini", "Bell peppers", "Eggplant", "Onions", "Olive oil", "Balsamic glaze", "Herbs"],
    allergens: {
      gluten: false,
      dairy: false,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: true,
      keto: true,
      halal: true,
      kosher: true,
    },
  },
  side3: {
    id: "side3",
    ingredients: ["Romaine lettuce", "Caesar dressing", "Croutons", "Parmesan cheese", "Anchovies"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: true,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: false,
      vegan: false,
      keto: true,
      halal: false,
      kosher: false,
    },
  },
  side4: {
    id: "side4",
    ingredients: ["Potatoes", "Vegetable oil", "Sea salt"],
    allergens: {
      gluten: false,
      dairy: false,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: true,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  side5: {
    id: "side5",
    ingredients: ["Jasmine rice", "Water", "Salt"],
    allergens: {
      gluten: false,
      dairy: false,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: false,
    },
    dietary: {
      vegetarian: true,
      vegan: true,
      keto: false,
      halal: true,
      kosher: true,
    },
  },

  // Desserts
  dessert1: {
    id: "dessert1",
    ingredients: ["Flour", "Sugar", "Cocoa powder", "Eggs", "Butter", "Chocolate ganache"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: true,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  dessert2: {
    id: "dessert2",
    ingredients: ["Cream cheese", "Sugar", "Eggs", "Graham cracker crust", "Berry compote"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
  dessert3: {
    id: "dessert3",
    ingredients: ["Ladyfingers", "Mascarpone cheese", "Coffee", "Cocoa powder", "Eggs", "Sugar"],
    allergens: {
      gluten: true,
      dairy: true,
      nuts: false,
      shellfish: false,
      soy: false,
      eggs: true,
    },
    dietary: {
      vegetarian: true,
      vegan: false,
      keto: false,
      halal: true,
      kosher: true,
    },
  },
}

