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

  const handleBoardLink = (boardId: string, path: string) => {
    if (!obzData) return

    let linkedBoard: OBFBoard | undefined

    // 1. Try direct ID lookup from manifest
    if (boardId && obzData.manifest.paths.boards[boardId]) {
      const manifestPath = obzData.manifest.paths.boards[boardId]
      linkedBoard = Object.values(obzData.boards).find(b => 
        b.id === boardId || 
        manifestPath.includes(b.id)
      )
    }

    // 2. Try path matching
    if (!linkedBoard && path) {
      linkedBoard = Object.values(obzData.boards).find(b => {
        const boardPath = obzData.manifest.paths.boards[b.id]
        return boardPath === path || path.includes(b.id)
      })
    }

    // 3. Try searching through all boards
    if (!linkedBoard) {
      linkedBoard = Object.values(obzData.boards).find(b => b.id === boardId)
    }

    if (linkedBoard && currentBoard) {
      setBoardHistory(prev => [...prev, currentBoard])
      setCurrentBoard(linkedBoard)
    }
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-background">
      {!currentBoard ? (
        <div className="relative h-full">
          <BoardLoader onBoardLoad={handleBoardLoad} />
        </div>
      ) : (
        <div className="relative h-full">
          <BoardDisplay
            board={currentBoard}
            onBoardLink={handleBoardLink}
          />
        </div>
      )}
    </main>
  )
}

