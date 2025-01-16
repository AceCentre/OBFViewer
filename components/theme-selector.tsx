"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from 'lucide-react'

const themes = [
  { name: "Light", value: "light", bg: "bg-white" },
  { name: "Gray", value: "gray", bg: "bg-gray-100" },
  { name: "Dark", value: "dark", bg: "bg-gray-950" },
  { name: "Black", value: "black", bg: "bg-black" },
]

export function ThemeSelector() {
  const setTheme = (theme: string) => {
    document.body.className = theme === 'dark' || theme === 'black' ? 'dark' : ''
    
    // Set background color
    document.body.style.backgroundColor = 
      theme === 'gray' ? '#f3f4f6' : 
      theme === 'black' ? '#000000' :
      theme === 'dark' ? '#030712' : '#ffffff'
    
    // Set message text color CSS variable
    document.documentElement.style.setProperty(
      '--message-text-color',
      theme === 'dark' || theme === 'black' ? '#ffffff' : '#000000'
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded ${theme.bg} border`} />
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

