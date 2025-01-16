"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Settings2, Maximize2, Upload } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { fonts } from "@/utils/fonts"
import type { OBFBoard, OBZManifest } from "@/types/obz"
import { useState } from 'react'
import JSZip from 'jszip'

interface SettingsProps {
  currentBoard: string
  showMessage: boolean
  onToggleMessage: (show: boolean) => void
  onBoardLoad: (boards: { [key: string]: OBFBoard }, rootBoard: OBFBoard, manifest: OBZManifest) => void
}

export function Settings({ currentBoard, showMessage, onToggleMessage, onBoardLoad }: SettingsProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const setFont = (fontValue: string) => {
    document.body.className = document.body.className
      .replace(/font-(raleway|opendyslexic|system)/g, '')
      .trim()
    document.body.classList.add(`font-${fontValue}`)
  }

  const themes = [
    { name: "Light", value: "light", textColor: "text-gray-900", bgColor: "bg-white" },
    { name: "Gray", value: "gray", textColor: "text-gray-900", bgColor: "bg-slate-100" },
    { name: "Dark", value: "dark", textColor: "text-white", bgColor: "bg-gray-950" },
    { name: "Black", value: "black", textColor: "text-white", bgColor: "bg-black" },
  ]

  const setTheme = (theme: string) => {
    document.body.className = theme === 'dark' || theme === 'black' ? 'dark' : ''
    
    document.body.style.backgroundColor = 
      theme === 'gray' ? '#f1f5f9' :
      theme === 'black' ? '#000000' :
      theme === 'dark' ? '#030712' : '#ffffff'
    
    document.documentElement.style.setProperty(
      '--message-text-color',
      theme === 'dark' || theme === 'black' ? '#ffffff' : '#000000'
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      if (file.name.endsWith('.obz')) {
        const buffer = await file.arrayBuffer()
        const zip = new JSZip()
        const contents = await zip.loadAsync(buffer)
        
        const manifestFile = contents.file("manifest.json")
        if (!manifestFile) {
          throw new Error("No manifest.json found in OBZ file")
        }

        const manifestJson = await manifestFile.async("text")
        const manifest: OBZManifest = JSON.parse(manifestJson)

        const boards: { [key: string]: OBFBoard } = {}
        for (const [id, path] of Object.entries(manifest.paths.boards)) {
          const boardFile = contents.file(path)
          if (!boardFile) continue
          
          const boardJson = await boardFile.async("text")
          const board: OBFBoard = JSON.parse(boardJson)
          boards[id] = board

          // Process images if they exist
          if (board.images) {
            for (const image of board.images) {
              if (image.path) {
                const imageFile = contents.file(image.path)
                if (imageFile) {
                  const imageData = await imageFile.async("base64")
                  image.data = `data:${image.content_type};base64,${imageData}`
                }
              }
            }
          }
        }

        const rootBoardFile = contents.file(manifest.root)
        if (!rootBoardFile) {
          throw new Error("Root board not found in OBZ file")
        }
        const rootBoardJson = await rootBoardFile.async("text")
        const rootBoard: OBFBoard = JSON.parse(rootBoardJson)

        onBoardLoad(boards, rootBoard, manifest)
      } else if (file.name.endsWith('.obf')) {
        const text = await file.text()
        const board = JSON.parse(text)
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
      }
    } catch (error) {
      console.error('Error loading file:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Clear the input
      event.target.value = ''
    }
  }

  return (
    <div className="fixed top-2 right-2 z-50 flex gap-2 print:hidden">
      <Button 
        variant="outline" 
        size="icon"
        className="bg-white dark:bg-gray-800 shadow-md border-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={handleFullscreen}
      >
        <Maximize2 className="h-4 w-4" />
        <span className="sr-only">Toggle fullscreen</span>
      </Button>
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white dark:bg-gray-800 shadow-md border-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-8">
            <div className="space-y-2">
              <Label>Current Board</Label>
              <p className="text-sm text-muted-foreground">{currentBoard}</p>
            </div>

            <div className="space-y-4">
              <Label>Load Different Board</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".obz,.obf"
                  onChange={handleFileUpload}
                  className="pr-20"
                />
                {isUploading && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Theme</Label>
              <RadioGroup
                defaultValue="light"
                onValueChange={setTheme}
                className="grid grid-cols-2 gap-2"
              >
                {themes.map((theme) => (
                  <Label
                    key={theme.value}
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer [&:has(:checked)]:ring-2 [&:has(:checked)]:ring-primary ${theme.bgColor} ${theme.textColor}`}
                  >
                    <RadioGroupItem value={theme.value} id={theme.value} className="border-current" />
                    <span>{theme.name}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Font</Label>
              <RadioGroup
                defaultValue="raleway"
                onValueChange={setFont}
                className="grid gap-2"
              >
                {fonts.map((font) => (
                  <Label
                    key={font.value}
                    className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer [&:has(:checked)]:bg-accent"
                    style={{ fontFamily: `var(--font-${font.value})` }}
                  >
                    <RadioGroupItem value={font.value} id={font.value} />
                    <span className="dark:text-white">The quick brown fox jumps over the lazy dog</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-message">Show Message Bar</Label>
              <Switch
                id="show-message"
                checked={showMessage}
                onCheckedChange={onToggleMessage}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
