"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Link } from 'lucide-react'
import JSZip from 'jszip'
import type { OBFBoard, OBZManifest } from "../types/obz"

interface BoardLoaderProps {
  onBoardLoad: (boards: { [key: string]: OBFBoard }, rootBoard: OBFBoard, manifest: OBZManifest) => void
}

export function BoardLoader({ onBoardLoad }: BoardLoaderProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleOBZFile = async (file: ArrayBuffer) => {
    try {
      setProgress(0)
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)
      setProgress(20)
      
      // First load manifest
      const manifestFile = contents.file("manifest.json")
      if (!manifestFile) {
        throw new Error("No manifest.json found in OBZ file")
      }

      const manifestJson = await manifestFile.async("text")
      const manifest: OBZManifest = JSON.parse(manifestJson)
      setProgress(40)

      console.log('Loaded manifest:', manifest)

      // Load all boards
      const boards: { [key: string]: OBFBoard } = {}
      const boardEntries = Object.entries(manifest.paths.boards)
      
      for (let i = 0; i < boardEntries.length; i++) {
        const [id, path] = boardEntries[i]
        const boardFile = contents.file(path)
        if (!boardFile) {
          console.warn(`Board file ${path} not found in OBZ`)
          continue
        }
        const boardJson = await boardFile.async("text")
        const board: OBFBoard = JSON.parse(boardJson)
        boards[id] = board

        // Handle embedded images
        for (const image of board.images) {
          if (image.path) {
            const imageFile = contents.file(image.path)
            if (imageFile) {
              const imageData = await imageFile.async("base64")
              image.data = `data:${image.content_type};base64,${imageData}`
            }
          }
        }

        // Calculate progress: 40-90% is for loading boards
        setProgress(40 + Math.round((i / boardEntries.length) * 50))
        console.log(`Loaded board ${id}:`, board.name)
      }

      // Load root board
      const rootBoardFile = contents.file(manifest.root)
      if (!rootBoardFile) {
        throw new Error("Root board not found in OBZ file")
      }
      const rootBoardJson = await rootBoardFile.async("text")
      const rootBoard: OBFBoard = JSON.parse(rootBoardJson)
      setProgress(100)

      onBoardLoad(boards, rootBoard, manifest)
    } catch (e) {
      console.error('Error parsing OBZ:', e)
      setError("Failed to parse OBZ file")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError("")

    try {
      if (file.name.endsWith('.obz')) {
        const buffer = await file.arrayBuffer()
        await handleOBZFile(buffer)
      } else if (file.name.endsWith('.obf')) {
        const text = await file.text()
        const board = JSON.parse(text)
        // Create a simple manifest for single board
        const manifest: OBZManifest = {
          format: "open-board-0.1",
          root: "board.obf",
          paths: {
            boards: { [board.id]: "board.obf" },
            images: {},
            sounds: {}
          }
        }
        onBoardLoad({ [board.id]: board }, board, manifest)
      } else {
        throw new Error("Unsupported file type")
      }
    } catch (e) {
      console.error('Error loading file:', e)
      setError("Failed to load file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>OBZ Reader</CardTitle>
          <CardDescription>
            Upload and interact with AAC communication boards in OBZ/OBF format. 
            This reader allows you to:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>View and navigate through communication boards</li>
            <li>Customize appearance with different themes and fonts</li>
            <li>Use the message bar for communication</li>
            <li>Print boards for offline use</li>
          </ul>
          <div className="text-sm text-muted-foreground mt-4 p-2 bg-muted rounded-md">
            <p>You can also load a board directly via URL:</p>
            <code className="block mt-2 p-2 bg-background rounded border">
              https://your-site.com/?board=https://example.com/path/to/board.obz
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Board</CardTitle>
          <CardDescription>
            Select an OBZ or OBF file to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Loading board...</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="file">Upload OBZ/OBF file</Label>
            <Input
              id="file"
              type="file"
              accept=".obz,.obf"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

