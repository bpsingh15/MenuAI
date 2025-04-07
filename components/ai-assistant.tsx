"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Loader2 } from "lucide-react"
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

  // Flatten menu data for easier access
  const allMenuItems = Object.values(menuData).flat()

  // Initialize chat with AI greeting
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "1",
        role: "assistant",
        content: `Hi there! I see you have ${order.items.length} items in your order totaling $${order.total.toFixed(2)}. To help you better, could you tell me how many people this order is for?`,
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
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
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
                                userMessage.toLowerCase().includes('update');
        
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
    try {
      // Create a system message with context about the order and menu
      const systemMessage: Message = {
        id: 'system',
        role: 'system',
        content: `You are a helpful AI assistant for a restaurant ordering system. Your role is to help users with their orders and answer questions about the menu.

Current Order:
${order.items.map(item => `- ${item.quantity}x ${item.item.name}`).join('\n')}

Menu Items:
${Object.entries(menuData).map(([category, items]) => 
  `${category}:\n${items.map(item => `- ${item.name} (${item.price})`).join('\n')}`
).join('\n\n')}

User Preferences:
${preferences.peopleCount ? `- Number of people: ${preferences.peopleCount}` : ''}
${preferences.dietaryRestrictions ? `- Dietary restrictions: ${preferences.dietaryRestrictions}` : ''}
${preferences.budget ? `- Budget: $${preferences.budget}` : ''}
${preferences.allergies && preferences.allergies.length > 0 ? `- Allergies: ${preferences.allergies.join(', ')}` : ''}

Instructions:
1. ONLY use action commands (ADD_ITEM, REMOVE_ITEM, REPLACE_ITEM) when the user EXPLICITLY asks to modify their order (e.g., "add", "remove", "delete", "replace", "change", "update").
2. For questions, recommendations, or general inquiries, DO NOT use action commands.
3. If the user wants to add items to their order, respond with "ACTION: ADD_ITEM [quantity] [item_name]"
4. If the user wants to remove items from their order, respond with "ACTION: REMOVE_ITEM [item_name]"
5. If the user wants to replace an item, respond with "ACTION: REPLACE_ITEM [old_item_name] [new_item_name]"
6. For multiple items in a single command, generate separate action commands for each item
7. Do not include any debug messages or markers in your response
8. Provide a natural, conversational response after the action commands
9. Consider the user's preferences when making recommendations
10. If the user asks a question, answer it directly without action commands`
      }
      
      // Create the messages array with the system message and user message
      const messages = [systemMessage, { id: Date.now().toString(), role: 'user', content: userMessage }]
      
      // Call the OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages,
          order,
          menuData
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error response:', errorData)
        throw new Error(`Failed to generate AI response: ${response.status} ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`)
      }
      
      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw error
    }
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

    // Analyze if order is appropriate for the number of people
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
      : `Thanks for the information! Let me analyze your order for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}${budget > 0 ? ` with a budget of $${budget}` : ""}.\n\n`

    response += `Your current order has:\n`
    if (categoryCounts.appetizers > 0) response += `- ${categoryCounts.appetizers} appetizer(s)\n`
    if (categoryCounts.mains > 0) response += `- ${categoryCounts.mains} main course(s)\n`
    if (categoryCounts.sides > 0) response += `- ${categoryCounts.sides} side dish(es)\n`
    if (categoryCounts.desserts > 0) response += `- ${categoryCounts.desserts} dessert(s)\n`

    response += `\nTotal cost: $${order.total.toFixed(2)} (about $${costPerPerson.toFixed(2)} per person)\n\n`

    // Add analysis
    if (!hasEnoughMains) {
      response += `⚠️ I notice you have ${categoryCounts.mains} main courses for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. Usually, each person would have their own main course.\n\n`
    }

    if (!hasEnoughFood) {
      response += `⚠️ Your order might not have enough food for ${peopleCount} ${peopleCount === 1 ? "person" : "people"}. I'd recommend adding more items.\n\n`
    }

    if (isOverBudget) {
      response += `⚠️ Your order total ($${order.total.toFixed(2)}) exceeds your budget of $${budget}.\n\n`
    }

    // Add recommendations
    response += `Recommendations:\n`

    if (!hasEnoughMains) {
      response += `- Consider adding ${peopleCount - categoryCounts.mains} more main course(s)\n`
    }

    if (categoryCounts.sides < peopleCount) {
      response += `- Adding ${peopleCount - categoryCounts.sides} more side dishes would enhance the meal\n`
    }

    if (isOverBudget) {
      response += `- To stay within budget, you might want to remove some items or choose less expensive alternatives\n`
    }

    if (!isUpdate) {
      response += `\nFeel free to ask me any questions about your order or let me know if you'd like to add or remove any items! I can also provide information about ingredients, allergens, and dietary restrictions.`
    }

    return response
  }

  // Generate allergen response
  const generateAllergenResponse = (question: string, order: Order, menuData: Record<string, MenuItem[]>): string => {
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

        if (allergens.length > 0) {
          return `${itemMatch.name} contains the following allergens: ${allergens.join(", ")}.`
        } else {
          return `${itemMatch.name} does not contain any common allergens.`
        }
      }
    }

    // Check if the question is about a specific allergen
    let allergenType = ""
    if (question.toLowerCase().includes("gluten")) allergenType = "gluten"
    else if (question.toLowerCase().includes("dairy")) allergenType = "dairy"
    else if (question.toLowerCase().includes("nut")) allergenType = "nuts"
    else if (question.toLowerCase().includes("shellfish")) allergenType = "shellfish"
    else if (question.toLowerCase().includes("soy")) allergenType = "soy"
    else if (question.toLowerCase().includes("egg")) allergenType = "eggs"

    if (allergenType) {
      // Check the order for items with this allergen
      const itemsWithAllergen = order.items
        .filter((orderItem) => {
          const foodInfo = foodInformation[orderItem.item.id]
          return foodInfo && foodInfo.allergens[allergenType as keyof typeof foodInfo.allergens]
        })
        .map((item) => item.item.name)

      if (itemsWithAllergen.length > 0) {
        return `In your current order, these items contain ${allergenType}: ${itemsWithAllergen.join(", ")}. If you have a severe allergy, please inform your server.`
      } else {
        return `Based on the information I have, none of the items in your current order contain ${allergenType}. However, please inform your server about any allergies as kitchen cross-contamination is possible.`
      }
    }

    // General allergen information for the entire order
    const allergenSummary = {
      gluten: [] as string[],
      dairy: [] as string[],
      nuts: [] as string[],
      shellfish: [] as string[],
      soy: [] as string[],
      eggs: [] as string[],
    }

    order.items.forEach((orderItem) => {
      const foodInfo = foodInformation[orderItem.item.id]
      if (foodInfo) {
        if (foodInfo.allergens.gluten) allergenSummary.gluten.push(orderItem.item.name)
        if (foodInfo.allergens.dairy) allergenSummary.dairy.push(orderItem.item.name)
        if (foodInfo.allergens.nuts) allergenSummary.nuts.push(orderItem.item.name)
        if (foodInfo.allergens.shellfish) allergenSummary.shellfish.push(orderItem.item.name)
        if (foodInfo.allergens.soy) allergenSummary.soy.push(orderItem.item.name)
        if (foodInfo.allergens.eggs) allergenSummary.eggs.push(orderItem.item.name)
      }
    })

    let response = "Here's an allergen summary for your current order:\n\n"

    if (allergenSummary.gluten.length > 0) {
      response += `Gluten: ${allergenSummary.gluten.join(", ")}\n`
    }
    if (allergenSummary.dairy.length > 0) {
      response += `Dairy: ${allergenSummary.dairy.join(", ")}\n`
    }
    if (allergenSummary.nuts.length > 0) {
      response += `Nuts: ${allergenSummary.nuts.join(", ")}\n`
    }
    if (allergenSummary.shellfish.length > 0) {
      response += `Shellfish: ${allergenSummary.shellfish.join(", ")}\n`
    }
    if (allergenSummary.soy.length > 0) {
      response += `Soy: ${allergenSummary.soy.join(", ")}\n`
    }
    if (allergenSummary.eggs.length > 0) {
      response += `Eggs: ${allergenSummary.eggs.join(", ")}\n`
    }

    if (response === "Here's an allergen summary for your current order:\n\n") {
      response =
        "Your current order doesn't contain any common allergens. However, please inform your server about any allergies as kitchen cross-contamination is possible."
    } else {
      response += "\nPlease inform your server about any allergies as kitchen cross-contamination is possible."
    }

    return response
  }

  // Generate dietary response
  const generateDietaryResponse = (question: string, order: Order, menuData: Record<string, MenuItem[]>): string => {
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

        if (dietaryInfo.length > 0) {
          return `${itemMatch.name} is suitable for the following dietary preferences: ${dietaryInfo.join(", ")}.`
        } else {
          return `${itemMatch.name} doesn't meet any of our tracked dietary preferences (vegetarian, vegan, keto, halal, kosher).`
        }
      }
    }

    // Check if the question is about a specific diet
    let dietType = ""
    if (question.toLowerCase().includes("vegetarian")) dietType = "vegetarian"
    else if (question.toLowerCase().includes("vegan")) dietType = "vegan"
    else if (question.toLowerCase().includes("keto")) dietType = "keto"
    else if (question.toLowerCase().includes("halal")) dietType = "halal"
    else if (question.toLowerCase().includes("kosher")) dietType = "kosher"

    if (dietType) {
      // Find items in the order that match this diet
      const matchingItems = order.items
        .filter((orderItem) => {
          const foodInfo = foodInformation[orderItem.item.id]
          return foodInfo && foodInfo.dietary[dietType as keyof typeof foodInfo.dietary]
        })
        .map((item) => item.item.name)

      // Find items in the menu that match this diet (for recommendations)
      const recommendedItems = allMenuItems
        .filter((item) => {
          const foodInfo = foodInformation[item.id]
          return (
            foodInfo &&
            foodInfo.dietary[dietType as keyof typeof foodInfo.dietary] &&
            !order.items.some((orderItem) => orderItem.item.id === item.id)
          )
        })
        .slice(0, 3)
        .map((item) => item.name)

      let response = ""

      if (matchingItems.length > 0) {
        response = `These items in your order are ${dietType}: ${matchingItems.join(", ")}.\n\n`
      } else {
        response = `None of the items in your current order are ${dietType}.\n\n`
      }

      if (recommendedItems.length > 0) {
        response += `Here are some ${dietType} options from our menu that you might want to consider: ${recommendedItems.join(", ")}.`
      }

      return response
    }

    // General dietary information for the entire order
    const dietarySummary = {
      vegetarian: [] as string[],
      vegan: [] as string[],
      keto: [] as string[],
      halal: [] as string[],
      kosher: [] as string[],
    }

    order.items.forEach((orderItem) => {
      const foodInfo = foodInformation[orderItem.item.id]
      if (foodInfo) {
        if (foodInfo.dietary.vegetarian) dietarySummary.vegetarian.push(orderItem.item.name)
        if (foodInfo.dietary.vegan) dietarySummary.vegan.push(orderItem.item.name)
        if (foodInfo.dietary.keto) dietarySummary.keto.push(orderItem.item.name)
        if (foodInfo.dietary.halal) dietarySummary.halal.push(orderItem.item.name)
        if (foodInfo.dietary.kosher) dietarySummary.kosher.push(orderItem.item.name)
      }
    })

    let response = "Here's a dietary summary for your current order:\n\n"

    if (dietarySummary.vegetarian.length > 0) {
      response += `Vegetarian: ${dietarySummary.vegetarian.join(", ")}\n`
    }
    if (dietarySummary.vegan.length > 0) {
      response += `Vegan: ${dietarySummary.vegan.join(", ")}\n`
    }
    if (dietarySummary.keto.length > 0) {
      response += `Keto-friendly: ${dietarySummary.keto.join(", ")}\n`
    }
    if (dietarySummary.halal.length > 0) {
      response += `Halal: ${dietarySummary.halal.join(", ")}\n`
    }
    if (dietarySummary.kosher.length > 0) {
      response += `Kosher: ${dietarySummary.kosher.join(", ")}\n`
    }

    if (response === "Here's a dietary summary for your current order:\n\n") {
      response =
        "I don't see any items in your order that match our tracked dietary preferences. Would you like me to recommend some options?"
    }

    return response
  }

  // Generate ingredient response
  const generateIngredientResponse = (question: string, menuData: Record<string, MenuItem[]>): string => {
    const itemMatch = findItemInQuestion(question, menuData)

    if (itemMatch) {
      const foodInfo = foodInformation[itemMatch.id]
      if (foodInfo && foodInfo.ingredients.length > 0) {
        return `${itemMatch.name} contains the following ingredients: ${foodInfo.ingredients.join(", ")}.`
      } else {
        return `I'm sorry, I don't have detailed ingredient information for ${itemMatch.name}.`
      }
    }

    return "Please specify which dish you'd like to know the ingredients for. For example, you can ask 'What's in the Mozzarella Sticks?' or 'What are the ingredients in the Grilled Salmon?'"
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

    // Try partial matches
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
  const generateRecommendations = (
    order: Order,
    peopleCount: number,
    budget: number,
    menuData: Record<string, MenuItem[]>,
  ): string => {
    // Get current order items
    const currentItemIds = order.items.map((item) => item.item.id)

    // Calculate remaining budget if applicable
    const remainingBudget = budget > 0 ? budget - order.total : 0

    // Generate recommendations based on what's missing
    let response = "Based on your current order, here are some recommendations:\n\n"

    // Check if there are enough main courses
    const mainCourses = order.items.filter((item) => item.item.id.startsWith("main"))
    const mainCoursesCount = mainCourses.reduce((sum, item) => sum + item.quantity, 0)

    if (mainCoursesCount < peopleCount) {
      response += "Main Courses:\n"
      const recommendedMains = menuData.mains
        .filter((item) => !currentItemIds.includes(item.id))
        .filter((item) => budget <= 0 || item.price <= remainingBudget)
        .slice(0, 2)

      if (recommendedMains.length > 0) {
        recommendedMains.forEach((item) => {
          response += `- ${item.name} ($${item.price.toFixed(2)}) - ${item.description}\n`
        })
      } else {
        response += "- You might want to add more main courses for your party\n"
      }
      response += "\n"
    }

    // Check if there are sides
    const sides = order.items.filter((item) => item.item.id.startsWith("side"))
    const sidesCount = sides.reduce((sum, item) => sum + item.quantity, 0)

    if (sidesCount < Math.ceil(peopleCount / 2)) {
      response += "Side Dishes:\n"
      const recommendedSides = menuData.sides
        .filter((item) => !currentItemIds.includes(item.id))
        .filter((item) => budget <= 0 || item.price <= remainingBudget)
        .slice(0, 2)

      if (recommendedSides.length > 0) {
        recommendedSides.forEach((item) => {
          response += `- ${item.name} ($${item.price.toFixed(2)}) - ${item.description}\n`
        })
      } else {
        response += "- Consider adding some side dishes to complement your meal\n"
      }
      response += "\n"
    }

    // Check if there are appetizers for sharing
    const appetizers = order.items.filter((item) => item.item.id.startsWith("app"))
    const appetizersCount = appetizers.reduce((sum, item) => sum + item.quantity, 0)

    if (appetizersCount < Math.ceil(peopleCount / 3)) {
      response += "Appetizers for sharing:\n"
      const recommendedApps = menuData.appetizers
        .filter((item) => !currentItemIds.includes(item.id))
        .filter((item) => budget <= 0 || item.price <= remainingBudget)
        .slice(0, 2)

      if (recommendedApps.length > 0) {
        recommendedApps.forEach((item) => {
          response += `- ${item.name} ($${item.price.toFixed(2)}) - ${item.description}\n`
        })
      } else {
        response += "- Shared appetizers would be a nice addition to your meal\n"
      }
      response += "\n"
    }

    if (budget > 0 && order.total > budget) {
      response += "Budget-Friendly Alternatives:\n"
      // Find less expensive alternatives to current items
      order.items.forEach((orderItem) => {
        const category = orderItem.item.id.startsWith("app")
          ? "appetizers"
          : orderItem.item.id.startsWith("main")
            ? "mains"
            : orderItem.item.id.startsWith("side")
              ? "sides"
              : "desserts"

        const cheaperAlternatives = menuData[category]
          .filter((item) => item.price < orderItem.item.price)
          .sort((a, b) => b.price - a.price) // Get the most expensive cheaper alternative
          .slice(0, 1)

        if (cheaperAlternatives.length > 0) {
          const alternative = cheaperAlternatives[0]
          const savings = (orderItem.item.price - alternative.price) * orderItem.quantity
          response += `- Consider replacing ${orderItem.item.name} with ${alternative.name} to save $${savings.toFixed(2)}\n`
        }
      })
    }

    response += "\nJust let me know if you'd like to add any of these items to your order."

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
    <Card 
      className={`w-full transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      ref={chatContainerRef}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-foreground">
              <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
              <path d="M12 8v8" />
              <path d="M5 3a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z" />
              <path d="M17 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Z" />
              <path d="M12 18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
              <path d="M5 15a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H5Z" />
              <path d="M17 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2Z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">AI Assistant</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((message: Message, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar>
                    <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="Ask about your order..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

