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

    // Ensure messages array exists and has content
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Create a comprehensive system prompt with current context
    const contextPrompt = `Current Order Context:
${order.items.length > 0 
  ? `Current Order: ${order.items.map((item: { quantity: number; name: string }) => `${item.quantity}x ${item.name}`).join(', ')}
Total Items: ${order.itemCount}
Order Total: $${order.total.toFixed(2)}`
  : 'No items in order yet'}

Available Menu Categories: ${menuData.map((cat: { category: string }) => cat.category).join(', ')}

Remember to:
1. Consider the current order when making suggestions
2. Be specific about which menu items you're referring to
3. Use exact item names when suggesting modifications
4. Consider portion sizes and order balance
5. Maintain conversation context`

    // Prepare messages array with context
    const apiMessages = [
      messages[0], // System prompt
      { role: "system", content: contextPrompt },
      ...messages.slice(1) // Rest of the conversation
    ]

    // Call the OpenAI API
    console.log("Calling OpenAI API with model: gpt-4-turbo-preview")
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })

    // Extract and return the response
    const responseMessage = completion.choices[0].message.content

    return NextResponse.json({ message: responseMessage })

  } catch (error) {
    console.error("Error in chat API:", error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    )
  }
} 