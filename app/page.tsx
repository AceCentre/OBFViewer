"use client"

import { useState } from "react"
import { BoardDisplay } from "@/components/board-display"
import { BoardLoader } from "@/components/board-loader"
import type { OBFBoard, OBZManifest } from "@/types/obz"

interface LoadedOBZ {
  boards: { [key: string]: OBFBoard }
  manifest: OBZManifest
}

export default function OBZReader() {
  const [obzData, setObzData] = useState<LoadedOBZ | null>(null)
  const [currentBoard, setCurrentBoard] = useState<OBFBoard | null>(null)
  const [boardHistory, setBoardHistory] = useState<OBFBoard[]>([])

  const handleBoardLoad = (
    newBoards: { [key: string]: OBFBoard }, 
    rootBoard: OBFBoard,
    manifest: OBZManifest
  ) => {
    setObzData({ boards: newBoards, manifest })
    setCurrentBoard(rootBoard)
    setBoardHistory([])
  }

  const handleBoardLink = (boardId: string) => {
    if (!obzData || !currentBoard) return

    // Find the linked board in the loaded boards
    const linkedBoard = obzData.boards[boardId]
    if (!linkedBoard) {
      console.error('Could not find linked board:', boardId)
      return
    }

    // Add current board to history before changing
    setBoardHistory(prev => [...prev, currentBoard])
    setCurrentBoard(linkedBoard)
  }

  const handleBack = () => {
    if (boardHistory.length > 0) {
      const previousBoard = boardHistory[boardHistory.length - 1]
      setBoardHistory(prev => prev.slice(0, -1))
      setCurrentBoard(previousBoard)
    }
  }

  return (
    <main className="min-h-screen">
      {currentBoard ? (
        <BoardDisplay 
          board={currentBoard}
          onBoardLink={handleBoardLink}
          onBack={boardHistory.length > 0 ? handleBack : undefined}
        />
      ) : (
        <BoardLoader onBoardLoad={handleBoardLoad} />
      )}
    </main>
  )
}
