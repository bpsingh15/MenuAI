import { OpenAI } from "openai"
import { NextResponse } from "next/server"
import type { Order, MenuItem } from "@/types/restaurant"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    console.log("Received chat API request")
    
    const { messages, order, menuData } = await req.json()
    console.log("Request parsed successfully")

    // Create a comprehensive system prompt
    const systemPrompt = `You are an intelligent AI assistant for a restaurant ordering system. Your role is to help customers with their food orders and provide personalized recommendations.

CONTEXT:
- Current order: ${JSON.stringify(order)}
- Menu items: ${JSON.stringify(menuData)}
- All menu items are available in the following categories: ${Object.keys(menuData).join(", ")}

CORE RESPONSIBILITIES:
1. Answer questions about ingredients, allergens, and dietary restrictions
2. Provide personalized recommendations based on order size, budget, and preferences
3. Analyze if the order quantity is appropriate for the number of people
4. Help customers modify their order (add/remove items)
5. Provide friendly, helpful, and informative responses

ORDER QUANTITY GUIDELINES:
- For 1 person: Recommend 1-2 appetizers, 1 main course, 1-2 sides, and optionally 1 dessert
- For 2 people: Recommend 1-2 appetizers to share, 1-2 main courses, 2-3 sides, and optionally 1-2 desserts
- For larger groups: Scale proportionally, considering shared items

IMPORTANT INSTRUCTIONS:
1. ONLY use action commands (ADD_ITEM, REMOVE_ITEM, REPLACE_ITEM) when the user EXPLICITLY asks to modify their order (e.g., "add", "remove", "delete", "replace", "change", "update").
2. For questions, recommendations, or general inquiries, DO NOT use action commands.
3. Pay close attention when users mention the number of people eating (e.g., "for 2 people", "me and my girlfriend", "family of 4")
4. When users ask if they're ordering too much or too little food, compare their current order to the guidelines above
5. Consider dietary preferences, allergies, and budget constraints mentioned by the user
6. If the order seems too large or too small, explain why and suggest specific adjustments
7. Always provide clear reasoning for your recommendations
8. Be proactive in identifying potential issues with the order (e.g., missing main courses, too many appetizers)
9. When suggesting changes, be specific about which items to add or remove
10. Handle complex questions with multiple conditions (e.g., "for 2 people, and my girlfriend doesn't eat much")
11. For dietary questions, analyze the current order against the menu to suggest better alternatives
12. Always respond to questions regardless of punctuation (?, !, etc.)

Keep your responses concise, friendly, and focused on helping with the order.`

    // Prepare the messages array with the system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ]

    // Call the OpenAI API with GPT-4
    console.log("Calling OpenAI API with model: gpt-4")
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })
    console.log("OpenAI API response received successfully")

    return NextResponse.json({ 
      content: response.choices[0].message.content 
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { error: "Failed to generate response", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 