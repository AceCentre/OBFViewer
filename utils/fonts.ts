import { Raleway, Outfit, Noto_Serif } from 'next/font/google'

export const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
})

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
})

// Define OpenDyslexic using CSS variables since we can't load local fonts in v0
export const fonts = [
  { 
    name: "OpenDyslexic", 
    value: "open-dyslexic", 
    variable: '--font-open-dyslexic',
    // We'll use the font-family fallback approach
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  { 
    name: "Raleway", 
    value: "raleway", 
    variable: raleway.variable,
    fallback: 'sans-serif'
  },
  { 
    name: "Noto Serif", 
    value: "noto-serif", 
    variable: notoSerif.variable,
    fallback: 'serif'
  },
  { 
    name: "Outfit", 
    value: "outfit", 
    variable: outfit.variable,
    fallback: 'sans-serif'
  },
]

