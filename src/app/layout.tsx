import "./globals.css"

import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { getServerSession } from "next-auth"
import NextTopLoader from "nextjs-toploader"

import { authOptions } from "@/lib/auth"
import ActiveStatus from "@/components/active-status"
import SessionProvider from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/providers/toast-provider"

import getSession from "./_actions/getSession"

const OpenSans = Open_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Resalah ",
  description: "Resalah is chat app",
  icons: "/logo.svg",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={OpenSans.className} suppressHydrationWarning>
        <SessionProvider session={session}>
          <NextTopLoader />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster />
            <ActiveStatus />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
