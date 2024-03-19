import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";
import buildHash from "../../public/build-hash.json";
import { NavBar } from './navbar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paladins Stats',
  description: 'A page for Paladins Statistics',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>
          <NavBar/>
          <div className='min-h-dvh p-8'>
            {children}
          </div>
          <footer>
            <p>Build Hash: {buildHash.hash}</p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
