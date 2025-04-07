import React from 'react'
import { Bot } from 'lucide-react'

interface GetAIAssistanceButtonProps {
  onClick: () => void
}

export function GetAIAssistanceButton({ onClick }: GetAIAssistanceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="get-ai-assistance"
      aria-label="Get AI Assistance"
    >
      <Bot className="h-5 w-5" />
      <span>Get AI Assistance</span>
    </button>
  )
} 