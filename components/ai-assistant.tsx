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
}

export function AIAssistant({ order, onClose, menuData, onAddItem, onRemoveItem }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [peopleCount, setPeopleCount] = useState<number | null>(null)

  // Flatten menu data for easier access
  const allMenuItems = Object.values(menuData).flat()

  // Initialize chat with AI greeting
  useEffect(() => {
    let initialGreeting = "Hi there! I'm your personal dining assistant. "
    
    if (order.items.length > 0) {
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
      initialGreeting += `I see you've added ${itemCount} ${itemCount === 1 ? 'item' : 'items'} to your cart. `
      initialGreeting += "How many people are you ordering for today? That'll help me make sure you have the perfect amount of food. "
      initialGreeting += "I can also help with menu recommendations, dietary needs, or answer any questions about our dishes!"
    } else {
      initialGreeting += "What kind of food are you in the mood for? I'd love to help you discover our menu and find something perfect for you. "
      initialGreeting += "Whether you're looking for recommendations, have dietary preferences, or want to know more about any dish, I'm here to help!"
    }

    const initialMessages: Message[] = [
      {
        id: "1",
        role: "assistant",
        content: initialGreeting,
      },
    ]
    setMessages(initialMessages)
    
    // Set visible after a short delay to trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Focus the input field
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [order.items.length, order.total])

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
    // Add user message to chat
    const userMessageObj: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user' as const
    }
    
    // Update messages state immediately
    setMessages((prev: Message[]) => [...prev, userMessageObj])
    
    // Set loading state
    setIsLoading(true)
    
    try {
      // Extract preferences and constraints from user message
      const preferences = extractPreferences(userMessage)
      
      // If the user is asking about the order quantity or mentioning people count
      if (userMessage.toLowerCase().includes('enough') || userMessage.toLowerCase().includes('people') || 
          userMessage.toLowerCase().includes('person') || preferences.peopleCount) {
        const peopleCount = preferences.peopleCount || 1
        const response = generateOrderAnalysis(order, peopleCount, preferences.budget || 0, menuData, false)
        addAIMessage(response)
        return
      }
      
      // Extract multi-item commands from user message
      const commands = extractMultiItemCommands(userMessage)
      
      // If we have commands, process them directly
      if (commands.length > 0) {
        console.log('Processing multi-item commands:', commands)
        
        // Process each command
        for (const command of commands) {
          if (command.type === 'add') {
            for (const item of command.items) {
              const menuItem = findItemByName(item.name)
              if (menuItem) {
                onAddItem(menuItem)
              }
            }
          } else if (command.type === 'remove') {
            for (const item of command.items) {
              const menuItem = findItemByName(item.name)
              if (menuItem) {
                onRemoveItem(menuItem.id)
              }
            }
          } else if (command.type === 'replace') {
            for (const item of command.items) {
              const menuItem = findItemByName(item.name)
              if (menuItem) {
                onRemoveItem(menuItem.id)
              }
            }
            
            if (command.replaceWith) {
              const replaceWithItem = findItemByName(command.replaceWith.name)
              if (replaceWithItem) {
                onAddItem(replaceWithItem)
              }
            }
          }
        }
        
        // Generate a response based on the commands
        let response = ''
        if (commands.length === 1) {
          const command = commands[0]
          if (command.type === 'add') {
            const itemNames = command.items.map(item => `${item.quantity} ${item.name}`).join(', ')
            response = `I've added ${itemNames} to your order.`
          } else if (command.type === 'remove') {
            const itemNames = command.items.map(item => item.name).join(', ')
            response = `I've removed ${itemNames} from your order.`
          } else if (command.type === 'replace') {
            const itemNames = command.items.map(item => item.name).join(', ')
            const replaceWithName = command.replaceWith ? `${command.replaceWith.quantity} ${command.replaceWith.name}` : ''
            response = `I've replaced ${itemNames} with ${replaceWithName} in your order.`
          }
        } else {
          // Multiple commands
          const actions = commands.map(command => {
            if (command.type === 'add') {
              const itemNames = command.items.map(item => `${item.quantity} ${item.name}`).join(', ')
              return `added ${itemNames}`
            } else if (command.type === 'remove') {
              const itemNames = command.items.map(item => item.name).join(', ')
              return `removed ${itemNames}`
            } else if (command.type === 'replace') {
              const itemNames = command.items.map(item => item.name).join(', ')
              const replaceWithName = command.replaceWith ? `${command.replaceWith.quantity} ${command.replaceWith.name}` : ''
              return `replaced ${itemNames} with ${replaceWithName}`
            }
            return ''
          }).filter(Boolean)
          
          response = `I've ${actions.join(' and ')} in your order.`
        }
        
        // Add AI response to chat
        addAIMessage(response)
      } else {
        // No commands found, use OpenAI API for natural language processing
        const aiResponse = await generateAIResponse(userMessage, preferences)
        
        // Check if the user is explicitly asking to modify their order
        const isModifyingOrder = userMessage.toLowerCase().includes('add') || 
                                userMessage.toLowerCase().includes('remove') || 
                                userMessage.toLowerCase().includes('delete') || 
                                userMessage.toLowerCase().includes('replace') || 
                                userMessage.toLowerCase().includes('change') ||
                                userMessage.includes('update');
        
        // Only process actions if the user is explicitly asking to modify their order
        if (isModifyingOrder) {
          // Process any actions indicated by the AI response
          const actions = processAIActions(aiResponse)
          
          // Only add the AI response to messages if it doesn't contain action markers
          // This prevents duplicate messages when actions are processed
          if (!aiResponse.includes('ACTION: ADD_ITEM') && 
              !aiResponse.includes('ACTION: REMOVE_ITEM') && 
              !aiResponse.includes('ACTION: REPLACE_ITEM')) {
            addAIMessage(aiResponse)
          }
        } else {
          // For non-modification queries, just add the AI response to the chat
          addAIMessage(aiResponse)
        }
        
        console.log('Processed AI response:', aiResponse)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      addAIMessage('I encountered an error processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Process any actions indicated by the AI response
  const processAIActions = (aiResponse: string) => {
    const actions: {
      type: 'add' | 'remove' | 'replace',
      items: { quantity: number, name: string }[],
      replaceWith?: { quantity: number, name: string }
    }[] = []
    
    // Extract add item actions
    const addItemMatches = aiResponse.matchAll(/ACTION: ADD_ITEM\s+(\d+)\s+(.+?)(?=\n|$)/gi)
    for (const match of addItemMatches) {
      const quantity = Number.parseInt(match[1])
      const name = match[2].trim()
      actions.push({
        type: 'add',
        items: [{ quantity, name }]
      })
    }
    
    // Extract remove item actions
    const removeItemMatches = aiResponse.matchAll(/ACTION: REMOVE_ITEM\s+(.+?)(?=\n|$)/gi)
    for (const match of removeItemMatches) {
      const name = match[1].trim()
      actions.push({
        type: 'remove',
        items: [{ quantity: 1, name }]
      })
    }
    
    // Extract replace item actions
    const replaceItemMatches = aiResponse.matchAll(/ACTION: REPLACE_ITEM\s+(.+?)\s+(.+?)(?=\n|$)/gi)
    for (const match of replaceItemMatches) {
      const oldName = match[1].trim()
      const newName = match[2].trim()
      actions.push({
        type: 'replace',
        items: [{ quantity: 1, name: oldName }],
        replaceWith: { quantity: 1, name: newName }
      })
    }
    
    // Process each action
    for (const action of actions) {
      if (action.type === 'add') {
        for (const item of action.items) {
          const menuItem = findItemByName(item.name)
          if (menuItem) {
            onAddItem(menuItem)
          }
        }
      } else if (action.type === 'remove') {
        for (const item of action.items) {
          const menuItem = findItemByName(item.name)
          if (menuItem) {
            onRemoveItem(menuItem.id)
          }
        }
      } else if (action.type === 'replace') {
        for (const item of action.items) {
          const menuItem = findItemByName(item.name)
          if (menuItem) {
            onRemoveItem(menuItem.id)
          }
        }
        
        if (action.replaceWith) {
          const replaceWithItem = findItemByName(action.replaceWith.name)
          if (replaceWithItem) {
            onAddItem(replaceWithItem)
          }
        }
      }
    }
    
    // Generate a response based on the actions
    let response = ''
    if (actions.length === 1) {
      const action = actions[0]
      if (action.type === 'add') {
        const itemNames = action.items.map(item => `${item.quantity} ${item.name}`).join(', ')
        response = `I've added ${itemNames} to your order.`
      } else if (action.type === 'remove') {
        const itemNames = action.items.map(item => item.name).join(', ')
        response = `I've removed ${itemNames} from your order.`
      } else if (action.type === 'replace') {
        const itemNames = action.items.map(item => item.name).join(', ')
        const replaceWithName = action.replaceWith ? `${action.replaceWith.quantity} ${action.replaceWith.name}` : ''
        response = `I've replaced ${itemNames} with ${replaceWithName} in your order.`
      }
    } else if (actions.length > 1) {
      // Multiple actions
      const actionDescriptions = actions.map(action => {
        if (action.type === 'add') {
          const itemNames = action.items.map(item => `${item.quantity} ${item.name}`).join(', ')
          return `added ${itemNames}`
        } else if (action.type === 'remove') {
          const itemNames = action.items.map(item => item.name).join(', ')
          return `removed ${itemNames}`
        } else if (action.type === 'replace') {
          const itemNames = action.items.map(item => item.name).join(', ')
          const replaceWithName = action.replaceWith ? `${action.replaceWith.quantity} ${action.replaceWith.name}` : ''
          return `replaced ${itemNames} with ${replaceWithName}`
        }
        return ''
      }).filter(Boolean)
      
      response = `I've ${actionDescriptions.join(' and ')} in your order.`
    }
    
    // Add the response to the chat if there are actions
    if (response) {
      addAIMessage(response)
    }
    
    return actions
  }

  const addAIMessage = (content: string) => {
    // Clean up any action markers from the response
    let cleanContent = content
    
    // Remove any action markers and their associated text
    cleanContent = cleanContent.replace(/ACTION: ADD_ITEM\s+\d+\s+.+?(?=\n|$)/gi, '')
    cleanContent = cleanContent.replace(/ACTION: REMOVE_ITEM\s+\d+\s+.+?(?=\n|$)/gi, '')
    cleanContent = cleanContent.replace(/ACTION: REPLACE_ITEM\s+\d+\s+.+?\s+with\s+\d+\s+.+?(?=\n|$)/gi, '')
    
    // Remove any empty lines that might be left after removing action markers
    cleanContent = cleanContent.replace(/\n\s*\n/g, '\n')
    
    // Remove any leading/trailing whitespace
    cleanContent = cleanContent.trim()
    
    // If the content is empty after cleaning, don't add an empty message
    if (!cleanContent) {
      return
    }
    
    // Log the cleaned content for debugging
    console.log("Adding AI message:", cleanContent)
    
    const newAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: cleanContent,
    }
    setMessages((prev: Message[]) => [...prev, newAiMessage])
  }

  const generateAIResponse = async (userMessage: string, preferences: {
    peopleCount?: number
    dietaryRestrictions?: string
    budget?: number
    allergies?: string[]
  }) => {
    const message = userMessage.toLowerCase()
    
    // Check for people count in the message
    const peopleMatch = message.match(/(\d+)\s*(people|persons?|diners?|guests?)/i)
    if (peopleMatch && !peopleCount) {
      const count = parseInt(peopleMatch[1])
      setPeopleCount(count)
      return generateOrderAnalysis(order, count, preferences.budget || 0, menuData, false)
    }

    // Check for dietary restrictions or allergies
    if (message.includes('allerg') || message.includes('allergic')) {
      return generateAllergenResponse(message, order, menuData)
    }
    if (message.includes('vegetarian') || message.includes('vegan') || message.includes('gluten') || 
        message.includes('dairy') || message.includes('diet')) {
      return generateDietaryResponse(message, order, menuData)
    }

    // Check for ingredient questions
    if (message.includes('ingredient') || message.includes('what is in') || message.includes('what\'s in')) {
      return generateIngredientResponse(message, menuData)
    }

    // Check for recommendations
    if (message.includes('recommend') || message.includes('suggest') || message.includes('what should') ||
        message.includes('popular') || message.includes('best')) {
      return generateRecommendations(order, peopleCount || 2, preferences.budget || 0, menuData)
    }

    // Default response with menu exploration
    return `I'd love to help you explore our menu! What interests you most? I can suggest some popular dishes, help you find options within your budget, recommend dishes based on your preferences, or tell you more about any specific dish that catches your eye. Just let me know what you're curious about!`
  }

  // Extract preferences and constraints from user messages
  const extractPreferences = (message: string) => {
    const preferences: {
      peopleCount?: number
      dietaryRestrictions?: string
      budget?: number
      allergies?: string[]
    } = {}
    
    // Extract number of people
    const peopleMatch = message.match(/(\d+)\s*(people|person|persons|guests|diners|ppl|individuals|folks|party|group|family|friends)/i)
    const justNumber = message.match(/^(\d+)$/i)
    const onePersonMatch = message.match(/one|1\s+person|just me|only me|myself|solo/i)
    const twoPersonMatch = message.match(/two|2\s+people|couple|date|me and|myself and/i)
    
    if (peopleMatch || justNumber) {
      preferences.peopleCount = Number.parseInt(peopleMatch ? peopleMatch[1] : justNumber![1])
    } else if (onePersonMatch) {
      preferences.peopleCount = 1
    } else if (twoPersonMatch) {
      preferences.peopleCount = 2
    }
    
    // Extract dietary restrictions
    const dietaryTerms = [
      { term: /vegan/i, restriction: "vegan" },
      { term: /vegetarian/i, restriction: "vegetarian" },
      { term: /gluten[- ]free/i, restriction: "gluten-free" },
      { term: /dairy[- ]free/i, restriction: "dairy-free" },
      { term: /keto/i, restriction: "keto" },
      { term: /halal/i, restriction: "halal" },
      { term: /kosher/i, restriction: "kosher" },
      { term: /low[- ]carb/i, restriction: "low-carb" },
      { term: /paleo/i, restriction: "paleo" },
    ]
    
    for (const { term, restriction } of dietaryTerms) {
      if (term.test(message)) {
        preferences.dietaryRestrictions = restriction
        break
      }
    }
    
    // Extract budget
    const budgetMatch = message.match(/\$?(\d+)/i)
    if (budgetMatch) {
      preferences.budget = Number.parseInt(budgetMatch[1])
    }
    
    // Extract allergies
    const allergyTerms = [
      { term: /allerg(?:y|ies) to (.+)/i, extract: (match: RegExpMatchArray) => match[1].split(/,|\band\b/).map(s => s.trim()) },
      { term: /allergic to (.+)/i, extract: (match: RegExpMatchArray) => match[1].split(/,|\band\b/).map(s => s.trim()) },
      { term: /can't eat (.+)/i, extract: (match: RegExpMatchArray) => match[1].split(/,|\band\b/).map(s => s.trim()) },
      { term: /cannot eat (.+)/i, extract: (match: RegExpMatchArray) => match[1].split(/,|\band\b/).map(s => s.trim()) },
    ]
    
    for (const { term, extract } of allergyTerms) {
      const match = message.match(term)
      if (match) {
        preferences.allergies = extract(match)
        break
      }
    }
    
    return preferences
  }

  // Extract multi-item commands from user messages
  const extractMultiItemCommands = (message: string) => {
    const commands: {
      type: 'add' | 'remove' | 'replace',
      items: { quantity: number, name: string }[],
      replaceWith?: { quantity: number, name: string }
    }[] = []
    
    // Check for add commands
    const addPatterns = [
      /add\s+(.+?)(?:\s+to\s+my\s+order)?/i,
      /can\s+you\s+add\s+(.+?)(?:\s+to\s+my\s+order)?/i,
      /i\s+want\s+to\s+add\s+(.+?)(?:\s+to\s+my\s+order)?/i,
      /i\s+would\s+like\s+to\s+add\s+(.+?)(?:\s+to\s+my\s+order)?/i,
      /please\s+add\s+(.+?)(?:\s+to\s+my\s+order)?/i,
    ]
    
    for (const pattern of addPatterns) {
      const match = message.match(pattern)
      if (match) {
        const itemsText = match[1]
        const items = parseItemList(itemsText)
        if (items.length > 0) {
          commands.push({
            type: 'add',
            items
          })
        }
      }
    }
    
    // Check for remove commands
    const removePatterns = [
      /remove\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /can\s+you\s+remove\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /i\s+want\s+to\s+remove\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /i\s+would\s+like\s+to\s+remove\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /please\s+remove\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /take\s+out\s+(.+?)(?:\s+from\s+my\s+order)?/i,
      /delete\s+(.+?)(?:\s+from\s+my\s+order)?/i,
    ]
    
    for (const pattern of removePatterns) {
      const match = message.match(pattern)
      if (match) {
        const itemsText = match[1]
        const items = parseItemList(itemsText)
        if (items.length > 0) {
          commands.push({
            type: 'remove',
            items
          })
        }
      }
    }
    
    // Check for replace commands
    const replacePatterns = [
      /replace\s+(.+?)\s+with\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /can\s+you\s+replace\s+(.+?)\s+with\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /i\s+want\s+to\s+replace\s+(.+?)\s+with\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /i\s+would\s+like\s+to\s+replace\s+(.+?)\s+with\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /please\s+replace\s+(.+?)\s+with\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /swap\s+(.+?)\s+for\s+(.+?)(?:\s+in\s+my\s+order)?/i,
      /change\s+(.+?)\s+to\s+(.+?)(?:\s+in\s+my\s+order)?/i,
    ]
    
    for (const pattern of replacePatterns) {
      const match = message.match(pattern)
      if (match) {
        const itemsText = match[1]
        const replaceWithText = match[2]
        const items = parseItemList(itemsText)
        const replaceWith = parseItemList(replaceWithText)
        
        if (items.length > 0 && replaceWith.length > 0) {
          commands.push({
            type: 'replace',
            items,
            replaceWith: replaceWith[0] // Just use the first replacement item
          })
        }
      }
    }
    
    return commands
  }
  
  // Parse a list of items from a string
  const parseItemList = (text: string): { quantity: number, name: string }[] => {
    const items: { quantity: number, name: string }[] = []
    
    // Split by common delimiters
    const parts = text.split(/(?:,|\sand\s|\s&\s|\sor\s)/i)
    
    for (const part of parts) {
      const trimmedPart = part.trim()
      if (!trimmedPart) continue
      
      // Try to extract quantity and name
      const quantityMatch = trimmedPart.match(/^(\d+)\s+(.+)$/)
      if (quantityMatch) {
        const quantity = Number.parseInt(quantityMatch[1])
        const name = quantityMatch[2].trim()
        items.push({ quantity, name })
      } else {
        // No quantity specified, assume 1
        items.push({ quantity: 1, name: trimmedPart })
      }
    }
    
    return items
  }

  // Find an item by name (fuzzy match)
  const findItemByName = (name: string): MenuItem | undefined => {
    const lowerName = name.toLowerCase()

    // Try exact match first
    const exactMatch = allMenuItems.find((item) => item.name.toLowerCase() === lowerName)

    if (exactMatch) return exactMatch

    // Try partial match
    return allMenuItems.find(
      (item) => item.name.toLowerCase().includes(lowerName) || lowerName.includes(item.name.toLowerCase()),
    )
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
            {messages.map((message) => (
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


