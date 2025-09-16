import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Discord to Obsidian',
  description: 'Connect Discord to Obsidian and automate note creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
