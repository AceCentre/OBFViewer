"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft } from 'lucide-react';
import type { OBFBoard, OBFButton } from "@/types/obz";
import { Settings } from "./settings";

interface BoardDisplayProps {
  board: OBFBoard;
  onBoardLink?: (boardId: string) => void;
  onBack?: () => void;
}

export function BoardDisplay({ board, onBoardLink, onBack }: BoardDisplayProps) {
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setMessage(prev => prev + '');
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleButtonClick = (button: OBFButton) => {
    if (button.load_board && onBoardLink) {
      const boardId = button.load_board.id;
      if (!boardId) {
        console.error('No board ID provided for navigation');
        return;
      }
      onBoardLink(boardId);
    } else {
      setMessage((prev) => prev + " " + (button.vocalization || button.label));
    }
  };

  const clearMessage = () => setMessage("");

  const getTextColor = (bgColor?: string) => {
    if (!bgColor) return '';
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '';
    const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? 'text-black' : 'text-white';
  };

  return (
    <div className="flex flex-col h-[100dvh] print:h-auto bg-background">
      <div className="flex items-center justify-between p-2 border-b">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
        <h1 className="text-lg font-medium">{board.name}</h1>
        <Settings 
          currentBoard={board.name}
          showMessage={showMessage}
          onToggleMessage={setShowMessage}
          onBoardLoad={(boards, rootBoard, manifest) => {
            // Handle board load from settings separately from navigation
            if (onBoardLink) {
              const boardId = rootBoard.id;
              onBoardLink(boardId);
            }
          }}
        />
      </div>

      {showMessage && message && (
        <div className="relative p-2 border-b bg-muted/50">
          <p className="pr-8">{message}</p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={clearMessage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div 
        className="grid gap-2 p-2 h-full overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${board.grid?.columns || 3}, 1fr)`,
        }}
      >
        {board.grid?.order.map((row, i) =>
          row.map((buttonId, j) => {
            if (!buttonId) return <div key={`empty-${i}-${j}`} />;
            
            const button = board.buttons?.find(b => b.id === buttonId);
            if (!button) return <div key={`missing-${i}-${j}`} />;
            
            const image = button.image_id 
              ? board.images?.find(img => img.id === button.image_id)
              : null;

            return (
              <Button
                key={button.id}
                onClick={() => handleButtonClick(button)}
                className="h-full min-h-[100px] flex flex-col items-center justify-center p-2 gap-2 relative hover:bg-accent/10"
                style={{
                  backgroundColor: button.background_color || undefined,
                  borderColor: button.border_color || undefined,
                }}
              >
                {image && (
                  <div className="w-16 h-16 flex-shrink-0">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || button.label}
                        className="w-full h-full object-contain"
                      />
                    ) : image.data ? (
                      <img
                        src={image.data}
                        alt={image.alt || button.label}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                )}
                <span className={`text-sm text-center line-clamp-2 ${getTextColor(button.background_color)}`}>
                  {button.label}
                </span>
                {button.load_board && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
}
