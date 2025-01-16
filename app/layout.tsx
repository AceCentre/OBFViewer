import "@/styles/globals.css"
import { raleway, outfit, notoSerif } from "@/utils/fonts"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${raleway.variable} ${outfit.variable} ${notoSerif.variable}`}>
      <body className={raleway.className}>{children}</body>
    </html>
  )
}

