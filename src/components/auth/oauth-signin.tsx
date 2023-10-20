"use client"

import { ReactElement, useState, useTransition } from "react"
import { AuthOptions, NextAuthOptions } from "next-auth"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "../ui/button"
import { IconGitHub, IconGoogle, IconSpinner } from "../ui/icons"

const oauthProviders = [
  { name: "Google", icon: <IconGoogle />, strategy: "google" },
  { name: "Github", icon: <IconGitHub />, strategy: "github" },
] satisfies {
  name: string
  icon: ReactElement
  strategy: NextAuthOptions["providers"][number]["id"]
}[]

export function OAuthSignIn() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleSignIn(strategy: string) {
    setIsLoading(strategy)
    try {
      await signIn(strategy, { callbackUrl: "/", redirect: false })

      toast.success("Signed in successfully!")
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
    setTimeout(() => setIsLoading(null), 4000)

    // })
  }
  return (
    <div className="flex w-full items-center gap-4">
      {oauthProviders.map((provider) => {
        return (
          <div key={provider.name} className="w-full">
            <Button
              aria-label={`Sign in with ${provider.name}`}
              variant={"outline"}
              className="w-full"
              disabled={isLoading === provider.strategy}
              onClick={() => handleSignIn(provider.strategy)}
            >
              <div className="mr-2">
                {isLoading === provider.strategy ? (
                  <IconSpinner />
                ) : (
                  provider.icon
                )}
              </div>

              {provider.name}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
