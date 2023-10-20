import React from "react"

import { Card } from "@/components/ui/card"
import { IconLogo } from "@/components/ui/icons"
import { OAuthSignIn } from "@/components/auth/oauth-signin"
import Link from "next/link"
import { SignUpWithEmail } from "@/components/auth/signup-email"

export default function SignUp() {
  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6">
          <IconLogo className="h-14 w-14" />
          <h2 className="text-2xl font-bold">Create new account</h2>

        <Card className="w-[450px] p-6">
          <SignUpWithEmail />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <OAuthSignIn />
          <div className="flex items-center justify-center mt-4">
            <p className="text-xs text-muted-foreground">You have an account? <Link href={'/signin'} className="font-bold text-foreground cursor-pointer">Signin</Link></p>
        </div>
        </Card>
      </div>
    </div>
  )
}
