import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";
import buildHash from "../../public/build-hash.json";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paladins Stats',
  description: 'A page for Paladins Statistics',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div>{buildHash.hash}</div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
