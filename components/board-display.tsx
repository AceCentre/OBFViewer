"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import type { OBFBoard, OBFButton } from "../types/obz"
import { Settings } from "./settings"

interface BoardDisplayProps {
  board: OBFBoard
  onBoardLink?: (boardId: string, path: string) => void
}

export function BoardDisplay({ board, onBoardLink }: BoardDisplayProps) {
  const [message, setMessage] = useState("")
  const [showMessage, setShowMessage] = useState(true)

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Force re-render
      setMessage(prev => prev + '')
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleButtonClick = (button: OBFButton) => {
    if (button.load_board) {
      if (onBoardLink) {
        const boardId = button.load_board.id || ''
        const path = button.load_board.path || ''
        onBoardLink(boardId, path)
      }
    } else {
      setMessage((prev) => prev + " " + (button.vocalization || button.label))
    }
  }

  const clearMessage = () => setMessage("")

  return (
    <div className="flex flex-col h-[100dvh] print:h-auto bg-background">
      <Settings 
        currentBoard={board.name}
        showMessage={showMessage}
        onToggleMessage={setShowMessage}
        onBoardLoad={onBoardLink}
      />

      {/* Message Bar */}
      {showMessage && (
        <div className="p-2 print:pb-8">
          <div className="relative p-3 min-h-[48px] border rounded-lg break-words bg-background" 
               style={{ color: 'var(--message-text-color)' }}>
            {message || "Message will appear here"}
            {message && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 print:hidden"
                onClick={clearMessage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid p-2 auto-rows-fr" 
             style={{
               gridTemplateColumns: `repeat(${board.grid.columns}, 1fr)`,
               gap: '8px',
             }}>
          {board.grid.order.map((row, i) =>
            row.map((buttonId, j) => {
              if (!buttonId) return <div key={`empty-${i}-${j}`} />
              const button = board.buttons.find((b) => b.id === buttonId)
              if (!button) return null

              const image = button.image_id
                ? board.images.find((img) => img.id === button.image_id)
                : null

              return (
                <Button
                  key={button.id}
                  className="flex flex-col items-center justify-center p-2 gap-1 relative hover:bg-accent print:border-2 print:hover:bg-transparent h-full"
                  style={{
                    backgroundColor: button.background_color || undefined,
                    borderColor: button.border_color || undefined,
                  }}
                  onClick={() => handleButtonClick(button)}
                >
                  {image && (
                    <div className="w-1/2 aspect-square print:w-16">
                      {image.url ? (
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : image.data ? (
                        <img
                          src={image.data || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                  )}
                  <span className={`text-sm text-center line-clamp-2 font-primary ${
                    button.background_color ? 
                      button.background_color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/) ? 
                        (match => {
                          const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
                          return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? 'text-black' : 'text-white'
                        })(button.background_color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)) 
                      : 'text-black'
                    : document.fullscreenElement ? 'text-black dark:text-white' : 'text-black dark:text-white'
                  }`}>
                    {button.label}
                  </span>
                  {button.load_board && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full print:hidden" />
                  )}
                </Button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

