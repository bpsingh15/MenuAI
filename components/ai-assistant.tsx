"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Loader2, Bot } from "lucide-react"
import type { Order, MenuItem } from "@/types/restaurant"
import { foodInformation } from "@/data/food-information"

interface AIAssistantProps {
  order: Order
  onClose: () => void
  menuData: Record<string, MenuItem[]>
  onAddItem: (item: MenuItem) => void
  onRemoveItem: (itemId: string) => void
}

type Message = {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  hidden?: boolean
}

// System prompt to guide the AI's behavior
const SYSTEM_PROMPT = `You are an AI dining assistant helping customers with their restaurant order. You have access to the full menu data, food information, and current order state.

Your role is to:
1. Help customers explore the menu and make informed decisions
2. Provide natural, context-aware responses about food items, ingredients, and dietary considerations
3. Analyze orders to ensure they make sense for the number of people dining
4. Make personalized recommendations based on preferences and previous choices
5. Handle order modifications when the user expresses intent to change their order

When responding:
- Maintain context from the entire conversation history
- Consider the current order state when making suggestions
- Be proactive in identifying user intent (e.g., if they ask "is this enough food?" or "should I add dessert?", analyze their order)
- Use the menu data and food information to provide accurate details
- Format responses in a conversational, helpful manner
- Avoid repeating information already discussed unless specifically asked
- Build upon previous context rather than starting fresh each time

For order modifications:
- Identify when users express intent to modify their order, even if not explicitly stated
- When users show interest in modifying their order (e.g., "should I add...", "is that too much..."), analyze the current order and provide contextual recommendations
- If a modification is needed, return an action marker in this format:
  ACTION: ADD_ITEM <quantity> <item_name>
  ACTION: REMOVE_ITEM <item_name>
  
Examples of natural intent handling:
- "should I add dessert?" → Analyze current order, consider number of diners, and suggest accordingly
- "is that too much for one person?" → Analyze portion sizes and provide specific recommendations
- "what goes well with my order?" → Consider current items and suggest complementary dishes
- "any vegetarian options?" → Check dietary info and suggest items that match the restriction

Remember to maintain a friendly, conversational tone while providing accurate, context-aware assistance.`

export function AIAssistant({ order, onClose, menuData, onAddItem, onRemoveItem }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [peopleCount, setPeopleCount] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Flatten menu data for easier access
  const allMenuItems = Object.values(menuData).flat()

  // Initialize chat with AI greeting
  useEffect(() => {
    const initialGreeting = generateInitialGreeting(order)
    const initialMessages: Message[] = [
      {
        id: "1",
        role: "system",
        content: SYSTEM_PROMPT,
        hidden: true
      },
      {
        id: "2",
        role: "assistant",
        content: initialGreeting,
      },
    ]
    setMessages(initialMessages)
    setIsInitialized(true)
    setIsVisible(true)
    
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Update order context in messages when order changes
  useEffect(() => {
    if (isInitialized && order) {
      const orderUpdateMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: JSON.stringify({ orderUpdate: order }),
        hidden: true
      }
      setMessages(prev => [...prev, orderUpdateMessage])
    }
  }, [order, isInitialized])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      const shouldScroll = scrollArea.scrollHeight - scrollArea.scrollTop <= scrollArea.clientHeight + 100
      
      if (shouldScroll) {
        setTimeout(() => {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [messages])

  // Function to scroll to the chat area - this will be called from the parent component
  const scrollToChat = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Process user message and generate AI response
  const processMessage = async (userMessage: string) => {
    const userMessageObj: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user'
    }
    
    setMessages(prev => [...prev, userMessageObj])
    setIsLoading(true)
    
    try {
      // Prepare context for the AI
      const context = {
        order: {
          items: order.items,
          total: order.total
        },
        menuData,
        foodInformation,
        conversationHistory: messages.filter(msg => !msg.hidden || msg.role === 'system')
      }

      // Call OpenAI API with the context
      const aiResponse = await generateAIResponse(userMessage, context)
      
      // Process any order modifications if needed
      if (aiResponse.includes('ACTION:')) {
        await processOrderModifications(aiResponse)
      }
        
      // Add AI response to chat
      addAIMessage(cleanResponse(aiResponse))
    } catch (error) {
      console.error('Error processing message:', error)
      addAIMessage('I encountered an error processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Clean AI response by removing action markers
  const cleanResponse = (response: string): string => {
    return response
      .replace(/ACTION: (ADD|REMOVE|REPLACE)_ITEM[^\n]*/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  // Process order modifications from AI response
  const processOrderModifications = async (response: string) => {
    const actions = response.match(/ACTION: (ADD|REMOVE|REPLACE)_ITEM[^\n]*/g) || []
    
    for (const action of actions) {
      if (action.includes('ADD_ITEM')) {
        const match = action.match(/ADD_ITEM (\d+) (.+)/)
        if (match) {
          const [_, quantity, itemName] = match
          const menuItem = findItemByName(itemName)
          if (menuItem) {
            for (let i = 0; i < parseInt(quantity); i++) {
              await onAddItem(menuItem)
            }
          }
        }
      } else if (action.includes('REMOVE_ITEM')) {
        const match = action.match(/REMOVE_ITEM (.+)/)
        if (match) {
          const [_, itemName] = match
          const menuItem = findItemByName(itemName)
          if (menuItem) {
            await onRemoveItem(menuItem.id)
          }
        }
      }
    }
  }

  // Generate AI response using OpenAI API
  const generateAIResponse = async (
    userMessage: string,
    context: {
      order: { items: Order['items']; total: number }
      menuData: Record<string, MenuItem[]>
      foodInformation: typeof foodInformation
      conversationHistory: Message[]
    }
  ): Promise<string> => {
    try {
      // Format the menu data for the AI
      const formattedMenu = Object.entries(context.menuData).map(([category, items]) => ({
        category,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description
        }))
      }))

      // Format the current order for the AI
      const formattedOrder = {
        items: context.order.items.map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          price: item.item.price,
          total: item.item.price * item.quantity,
          category: Object.entries(context.menuData).find(([_, items]) => 
            items.some(menuItem => menuItem.id === item.item.id)
          )?.[0] || 'unknown'
        })),
        total: context.order.total,
        itemCount: context.order.items.reduce((sum, item) => sum + item.quantity, 0)
      }

      // Format food information for better context
      const formattedFoodInfo = Object.entries(context.foodInformation).reduce((acc, [id, info]) => {
        const menuItem = Object.values(context.menuData)
          .flat()
          .find(item => item.id === id)
        
        if (menuItem) {
          acc[menuItem.name] = {
            ...info,
            price: menuItem.price,
            description: menuItem.description
          }
        }
        return acc
      }, {} as Record<string, any>)

      // Prepare messages for the API
      const messages = [
        { 
          role: "system", 
          content: SYSTEM_PROMPT 
        },
        {
          role: "system",
          content: `Current context:
Menu Categories: ${Object.keys(context.menuData).join(', ')}
Order Summary: ${formattedOrder.itemCount} items, Total: $${formattedOrder.total.toFixed(2)}
Conversation History: ${context.conversationHistory.length - 1} previous messages`
        },
        ...context.conversationHistory
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        {
          role: "system",
          content: JSON.stringify({
            currentOrder: formattedOrder,
            menu: formattedMenu,
            foodInformation: formattedFoodInfo
          })
        },
        { 
          role: "user", 
          content: userMessage 
        }
      ]

      // Make the API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages,
          order: formattedOrder,
          menuData: formattedMenu
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      return data.message

    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I apologize, but I encountered an error processing your request. Could you please try again?"
    }
  }

  // Generate initial greeting based on order state
  const generateInitialGreeting = (order: Order): string => {
    if (order.items.length > 0) {
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
      return `Hi there! I see you've added ${itemCount} ${itemCount === 1 ? 'item' : 'items'} to your cart. How can I help you with your order today?`
    }
    return `Hi there! I'm here to help you explore our menu and find the perfect dishes for you. What kind of food are you in the mood for?`
  }

  // Find an item by name (fuzzy match)
  const findItemByName = (name: string): MenuItem | undefined => {
    const allMenuItems = Object.values(menuData).flat()
    const lowerName = name.toLowerCase()

    return allMenuItems.find(
      item => item.name.toLowerCase() === lowerName ||
             item.name.toLowerCase().includes(lowerName) ||
             lowerName.includes(item.name.toLowerCase())
    )
  }

  // Add AI message to chat
  const addAIMessage = (content: string) => {
    if (!content.trim()) return
    
    const newAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: content,
    }
    setMessages(prev => [...prev, newAiMessage])
  }

  // Summarize the current order
  const summarizeOrder = (order: Order): string => {
    if (order.items.length === 0) {
      return "Your order is currently empty."
    }

    let summary = ""
    order.items.forEach((item) => {
      summary += `- ${item.quantity}x ${item.item.name} ($${(item.item.price * item.quantity).toFixed(2)})\n`
    })

    return summary
  }

  // Generate comprehensive order analysis
  const generateOrderAnalysis = (
    order: Order,
    peopleCount: number,
    budget: number,
    menuData: Record<string, MenuItem[]>,
    isUpdate = false,
  ): string => {
    // Count items by category
    const categoryCounts = {
      appetizers: 0,
      mains: 0,
      sides: 0,
      desserts: 0,
    }

    order.items.forEach((item) => {
      const itemId = item.item.id
      if (itemId.startsWith("app")) categoryCounts.appetizers += item.quantity
      else if (itemId.startsWith("main")) categoryCounts.mains += item.quantity
      else if (itemId.startsWith("side")) categoryCounts.sides += item.quantity
      else if (itemId.startsWith("dessert")) categoryCounts.desserts += item.quantity
    })

    // Calculate total items and cost per person
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const costPerPerson = order.total / peopleCount

    // Determine if there's enough food
    const hasEnoughMains = categoryCounts.mains >= peopleCount
    const hasEnoughFood = totalItems >= peopleCount * 2 // Assuming each person needs at least 2 items

    // Check budget constraints
    const isOverBudget = budget > 0 && order.total > budget

    // Generate response
    let response = isUpdate
      ? `Here's my analysis of your updated order for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}${budget > 0 ? ` with a budget of $${budget}` : ""}:\n\n`
      : `Thanks for letting me know! Let me take a look at your order for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}.\n\n`

    if (order.items.length === 0) {
      return "Your cart is empty at the moment. Would you like some recommendations to get started? I can suggest dishes based on your preferences!"
    }

    response += `You currently have:\n`
    if (categoryCounts.appetizers > 0) response += `- ${categoryCounts.appetizers} appetizer(s)\n`
    if (categoryCounts.mains > 0) response += `- ${categoryCounts.mains} main course(s)\n`
    if (categoryCounts.sides > 0) response += `- ${categoryCounts.sides} side dish(es)\n`
    if (categoryCounts.desserts > 0) response += `- ${categoryCounts.desserts} dessert(s)\n`

    response += `\nYour total comes to $${order.total.toFixed(2)}, which works out to about $${costPerPerson.toFixed(2)} per person.\n\n`

    // Add analysis in a conversational way
    if (!hasEnoughMains) {
      response += `I notice you have ${categoryCounts.mains} main course${categoryCounts.mains === 1 ? '' : 's'} for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. Usually, each person might want their own main dish for a complete meal.\n\n`
    }

    if (!hasEnoughFood) {
      response += `It seems like you might want to add a few more items to ensure everyone has enough to eat. `
    }

    if (isOverBudget) {
      response += `Just a heads up - your current total ($${order.total.toFixed(2)}) is a bit over your budget of $${budget}. I can suggest some alternatives if you'd like.\n\n`
    }

    // Add recommendations in a natural way
    response += `Here's what I'd suggest:\n`

    if (!hasEnoughMains) {
      response += `• Maybe add ${peopleCount - categoryCounts.mains} more main dish${(peopleCount - categoryCounts.mains) === 1 ? '' : 'es'} so everyone has their own\n`
    }

    if (categoryCounts.sides < peopleCount) {
      response += `• A few more sides would round out the meal nicely\n`
    }

    if (isOverBudget) {
      response += `• I can help you find some equally delicious options that better fit your budget\n`
    }

    if (!isUpdate) {
      response += `\nWhat would you like to know more about? I'm happy to suggest specific dishes, tell you about ingredients, or help modify your order!`
    }

    return response
  }

  // Generate dietary response
  const generateDietaryResponse = (question: string, order: Order, menuData: Record<string, MenuItem[]>): string => {
    const lowerQuestion = question.toLowerCase()
    const isAskingAboutOrder = lowerQuestion.includes('order') || lowerQuestion.includes('cart') || lowerQuestion.includes('current')
    
    // First, analyze the current order if the user is asking about it
    if (isAskingAboutOrder && order.items.length > 0) {
      const dietaryIssues: string[] = []
      const safeItems: string[] = []
      
      // Determine which dietary restriction we're checking for
      let dietaryCheck = {
        type: '',
        friendly: false
      }
      
      if (lowerQuestion.includes('gluten')) {
        dietaryCheck = { type: 'gluten', friendly: false }
      } else if (lowerQuestion.includes('vegan')) {
        dietaryCheck = { type: 'vegan', friendly: true }
      } else if (lowerQuestion.includes('vegetarian')) {
        dietaryCheck = { type: 'vegetarian', friendly: true }
      } else if (lowerQuestion.includes('halal')) {
        dietaryCheck = { type: 'halal', friendly: true }
      } else if (lowerQuestion.includes('kosher')) {
        dietaryCheck = { type: 'kosher', friendly: true }
      }
      
      // Analyze each item in the order
      order.items.forEach(orderItem => {
        const info = foodInformation[orderItem.item.id]
        if (info) {
          if (dietaryCheck.friendly) {
            // For dietary preferences (vegan, vegetarian, etc.)
            if (info.dietary[dietaryCheck.type as keyof typeof info.dietary]) {
              safeItems.push(orderItem.item.name)
      } else {
              dietaryIssues.push(orderItem.item.name)
            }
          } else {
            // For allergens/restrictions (gluten, etc.)
            if (info.allergens[dietaryCheck.type as keyof typeof info.allergens]) {
              dietaryIssues.push(orderItem.item.name)
            } else {
              safeItems.push(orderItem.item.name)
            }
          }
        }
      })
      
      // Generate a context-aware response
      let response = ''
      if (dietaryIssues.length > 0) {
        response = `In your current order, ${dietaryIssues.join(', ')} ${dietaryIssues.length === 1 ? 'is' : 'are'} not ${dietaryCheck.friendly ? `${dietaryCheck.type}-friendly` : `${dietaryCheck.type}-free`}. `
        if (safeItems.length > 0) {
          response += `However, ${safeItems.join(', ')} ${safeItems.length === 1 ? 'is' : 'are'} ${dietaryCheck.friendly ? `${dietaryCheck.type}-friendly` : `${dietaryCheck.type}-free`}. `
        }
        response += `Would you like me to suggest some alternatives for the ${dietaryIssues.length === 1 ? 'item' : 'items'} that don't meet your dietary needs?`
      } else if (safeItems.length > 0) {
        response = `Good news! All the items in your order (${safeItems.join(', ')}) are ${dietaryCheck.friendly ? `${dietaryCheck.type}-friendly` : `${dietaryCheck.type}-free`}. Would you like to explore more options that match your dietary preferences?`
      }
      
      if (response) return response
    }

    // Check if the question is about a specific item
    const itemMatch = findItemInQuestion(question, menuData)
    if (itemMatch) {
      const foodInfo = foodInformation[itemMatch.id]
      if (foodInfo) {
        const dietaryInfo = []
        if (foodInfo.dietary.vegetarian) dietaryInfo.push("vegetarian")
        if (foodInfo.dietary.vegan) dietaryInfo.push("vegan")
        if (foodInfo.dietary.keto) dietaryInfo.push("keto-friendly")
        if (foodInfo.dietary.halal) dietaryInfo.push("halal")
        if (foodInfo.dietary.kosher) dietaryInfo.push("kosher")

        let response = ''
        if (dietaryInfo.length > 0) {
          response = `The ${itemMatch.name} is ${dietaryInfo.join(" and ")}-friendly. `
        } else {
          response = `The ${itemMatch.name} doesn't specifically meet vegetarian, vegan, keto, halal, or kosher requirements. `
        }
        
        // Add context-aware suggestions
        if (order.items.length > 0) {
          response += `Would you like me to check if it's compatible with the other items in your order or suggest alternatives?`
        } else {
          response += `Would you like to know more about its ingredients or explore similar dishes that match your dietary preferences?`
        }
        return response
      }
    }

    // If no specific context, provide a helpful response
    if (order.items.length > 0) {
      return `I can help you check your current order for any dietary restrictions or find additional dishes that match your preferences. What specific dietary requirements should I look for?`
    } else {
      return `I'd be happy to help you find dishes that match your dietary preferences! Are you looking for vegetarian, vegan, gluten-free, or other specific options? I can guide you to the perfect dishes for your needs.`
    }
  }

  // Generate allergen response
  const generateAllergenResponse = (question: string, order: Order, menuData: Record<string, MenuItem[]>): string => {
    const lowerQuestion = question.toLowerCase()
    const isAskingAboutOrder = lowerQuestion.includes('order') || lowerQuestion.includes('cart') || lowerQuestion.includes('current')
    
    // First, analyze the current order if the user is asking about it
    if (isAskingAboutOrder && order.items.length > 0) {
      const allergenIssues = new Map<string, string[]>()
      const safeItems: string[] = []
      
      // Analyze each item in the order
      order.items.forEach(orderItem => {
        const info = foodInformation[orderItem.item.id]
        if (info) {
          let hasAllergens = false
          Object.entries(info.allergens).forEach(([allergen, present]) => {
            if (present) {
              hasAllergens = true
              if (!allergenIssues.has(allergen)) {
                allergenIssues.set(allergen, [])
              }
              allergenIssues.get(allergen)!.push(orderItem.item.name)
            }
          })
          if (!hasAllergens) {
            safeItems.push(orderItem.item.name)
          }
        }
      })
      
      // Generate a context-aware response
      if (allergenIssues.size > 0) {
        let response = `I've checked your order for allergens. Here's what I found:\n\n`
        allergenIssues.forEach((items, allergen) => {
          response += `• ${items.join(', ')} contain${items.length === 1 ? 's' : ''} ${allergen}\n`
        })
        if (safeItems.length > 0) {
          response += `\nHowever, ${safeItems.join(', ')} ${safeItems.length === 1 ? 'is' : 'are'} free from common allergens. `
        }
        response += `\nWould you like me to suggest some allergen-free alternatives for any of these items?`
      return response
      } else if (safeItems.length > 0) {
        return `Good news! All the items in your current order (${safeItems.join(', ')}) are free from common allergens. Would you like to explore more allergen-free options?`
      }
    }

    // Check if the question is about a specific item
    const itemMatch = findItemInQuestion(question, menuData)
    if (itemMatch) {
      const foodInfo = foodInformation[itemMatch.id]
      if (foodInfo) {
        const allergens = []
        if (foodInfo.allergens.gluten) allergens.push("gluten")
        if (foodInfo.allergens.dairy) allergens.push("dairy")
        if (foodInfo.allergens.nuts) allergens.push("nuts")
        if (foodInfo.allergens.shellfish) allergens.push("shellfish")
        if (foodInfo.allergens.soy) allergens.push("soy")
        if (foodInfo.allergens.eggs) allergens.push("eggs")

        let response = ''
        if (allergens.length > 0) {
          response = `I should let you know that the ${itemMatch.name} contains ${allergens.join(", ")}. `
          if (order.items.length > 0) {
            response += `Would you like me to check how it compares with the allergens in your current order items or suggest alternatives?`
          } else {
            response += `Would you like me to suggest some similar dishes without these allergens?`
          }
        } else {
          response = `Good news! The ${itemMatch.name} is free from common allergens. `
          if (order.items.length > 0) {
            response += `It should be compatible with the other items in your order. Would you like to know more about its ingredients?`
          } else {
            response += `Would you like to know more about its ingredients or explore other allergen-free options?`
          }
        }
        return response
      }
    }

    // If no specific context, provide a helpful response
    if (order.items.length > 0) {
      return `I'll be happy to check your current order for any allergens. Which specific allergens would you like me to look for? I can help identify items containing common allergens like gluten, dairy, nuts, shellfish, soy, or eggs.`
    } else {
      return `I want to help ensure you have a safe dining experience! Could you tell me which allergens you need to avoid? I can help you find dishes that are free from specific allergens and suggest alternatives that match your needs.`
    }
  }

  // Generate ingredient response
  const generateIngredientResponse = (question: string, menuData: Record<string, MenuItem[]>): string => {
    const itemMatch = findItemInQuestion(question, menuData)

    if (itemMatch) {
      const foodInfo = foodInformation[itemMatch.id]
      if (foodInfo && foodInfo.ingredients.length > 0) {
        let response = `The ${itemMatch.name} is made with ${foodInfo.ingredients.join(", ")}. `
        response += `Would you like to know about any allergens or dietary information for this dish?`
        return response
      } else {
        return `I'd love to tell you more about the ${itemMatch.name}, but I don't have the detailed ingredient list at hand. Is there something specific you'd like to know about it? I can tell you about its taste, portion size, or suggest similar dishes!`
      }
    }

    return `I'd be happy to tell you about any dish's ingredients! Which item are you curious about?`
  }

  // Find an item mentioned in a question
  const findItemInQuestion = (question: string, menuData: Record<string, MenuItem[]>): MenuItem | undefined => {
    const lowerQuestion = question.toLowerCase()

    // Try to find any menu item mentioned in the question
    for (const item of allMenuItems) {
      if (lowerQuestion.includes(item.name.toLowerCase())) {
        return item
      }
    }

    // Try partial matches for more natural language understanding
    for (const item of allMenuItems) {
      const words = item.name.toLowerCase().split(" ")
      for (const word of words) {
        if (word.length > 3 && lowerQuestion.includes(word)) {
          return item
        }
      }
    }

    return undefined
  }

  // Generate recommendations
  const generateRecommendations = (order: Order, peopleCount: number, budget: number, menuData: Record<string, MenuItem[]>): string => {
    const remainingBudget = budget > 0 ? budget - order.total : 0
    const perPersonBudget = remainingBudget > 0 ? remainingBudget / peopleCount : 0

    // Get items not in the current order
    const availableItems = allMenuItems.filter(
      item => !order.items.some(orderItem => orderItem.item.id === item.id)
    )

    // Sort by popularity (you could add a popularity field to items)
    const popularItems = availableItems
      .filter(item => item.price <= perPersonBudget || budget === 0)
      .slice(0, 5)

    let response = ""

    if (order.items.length === 0) {
      response = "Let me suggest some of our most popular dishes that I think you'll love!\n\n"
      } else {
      response = "Based on what you've ordered, here are some great additions that would complement your meal:\n\n"
    }

    popularItems.forEach(item => {
      response += `• ${item.name} ($${item.price.toFixed(2)}) - ${item.description}\n`
    })

    if (budget > 0) {
      if (remainingBudget > 0) {
        response += `\nThese suggestions fit within your remaining budget of $${remainingBudget.toFixed(2)} (about $${perPersonBudget.toFixed(2)} per person).`
      } else {
        response += `\nJust a heads up - you've reached your budget of $${budget.toFixed(2)}. Would you like to see some more affordable alternatives?`
      }
    }

    response += "\n\nWould you like to know more about any of these dishes? I can tell you about their ingredients, portion sizes, or suggest other options!"

    return response
  }

  // Analyze if order has enough food
  const analyzeOrderQuantity = (order: Order, peopleCount: number, menuData: Record<string, MenuItem[]>): string => {
    // Count items by category
    const categoryCounts = {
      appetizers: 0,
      mains: 0,
      sides: 0,
      desserts: 0,
    }

    order.items.forEach((item) => {
      const itemId = item.item.id
      if (itemId.startsWith("app")) categoryCounts.appetizers += item.quantity
      else if (itemId.startsWith("main")) categoryCounts.mains += item.quantity
      else if (itemId.startsWith("side")) categoryCounts.sides += item.quantity
      else if (itemId.startsWith("dessert")) categoryCounts.desserts += item.quantity
    })

    // Calculate food per person
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const itemsPerPerson = totalItems / peopleCount

    let response = ""

    if (categoryCounts.mains < peopleCount) {
      response += `⚠️ You have ${categoryCounts.mains} main courses for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. Usually, each person would have their own main course.\n\n`
    }

    if (itemsPerPerson < 2) {
      response += `Your order might not have enough food for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. You currently have about ${itemsPerPerson.toFixed(1)} items per person, while a typical meal might include at least 2-3 items per person (including a main course and sides).\n\n`

      response += "I recommend:\n"
      if (categoryCounts.mains < peopleCount) {
        response += `- Adding ${peopleCount - categoryCounts.mains} more main course(s)\n`
      }
      if (categoryCounts.sides < peopleCount) {
        response += `- Adding more side dishes to complement the meal\n`
      }
      if (categoryCounts.appetizers < Math.ceil(peopleCount / 3)) {
        response += `- Adding some shared appetizers\n`
      }
    } else if (itemsPerPerson > 4) {
      response += `Your order might have more food than needed for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. You currently have about ${itemsPerPerson.toFixed(1)} items per person, which is quite generous.\n\n`

      response += "If you want to reduce the order, consider:\n"
      if (categoryCounts.appetizers > Math.ceil(peopleCount / 2)) {
        response += `- Reducing the number of appetizers\n`
      }
      if (categoryCounts.sides > peopleCount) {
        response += `- Reducing the number of side dishes\n`
      }
      if (categoryCounts.desserts > Math.ceil(peopleCount / 2)) {
        response += `- Reducing the number of desserts\n`
      }
    } else {
      response += `Your order seems to have a good amount of food for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. You have about ${itemsPerPerson.toFixed(1)} items per person, which is typically sufficient for a satisfying meal.\n\n`

      if (categoryCounts.mains < peopleCount) {
        response += "However, you might want to ensure everyone has a main course.\n"
      }
    }

    response += "\nI can help you adjust your order if you'd like."

    return response
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      processMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className={`ai-assistant-container ${isVisible ? 'visible' : ''}`}>
      <div className="ai-assistant">
        <div className="ai-assistant-header">
          <h3 className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            AI Food Assistant
          </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
            className="hover:bg-muted"
            aria-label="Close AI Assistant"
        >
            <X className="h-5 w-5" />
        </Button>
        </div>
        
        <div className="ai-assistant-content" ref={scrollAreaRef}>
          <div className="messages">
            {messages
              .filter(message => !message.hidden)
              .map((message) => (
              <div
                key={message.id}
                className={`${message.role === "user" ? "user-message" : "ai-message"}`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        </div>
        
        <form
          onSubmit={handleSubmit}
          className="ai-input"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}


