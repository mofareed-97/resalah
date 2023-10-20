"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { signInSchema } from "@/lib/validation/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { IconSpinner } from "../ui/icons"

type Inputs = z.infer<typeof signInSchema>

export function SignInWithEmail() {
  const [isLoading, setIsLoading] = React.useState(false)

  const router = useRouter()

  const form = useForm<Inputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: Inputs) {
    setIsLoading(true)
     signIn('credentials', {...data, redirect:false}).then((user)=>{
      if(user?.error){
        catchError(user.error)
        return
      }

      if(user?.ok && !user?.error){
        toast.success("logged in successfully!")
        router.push("/")
      }
     }).finally(()=> setIsLoading(false))
      
  }
  return (
    <Form {...form}>
      <form
        onSubmit={(...args) => form.handleSubmit(onSubmit)(...args)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="***********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type="submit">Submit</Button> */}

        <Button disabled={isLoading} className="w-full">
          {isLoading ? <IconSpinner className="mr-2" /> : null}
          Sign in with email
          <span className="sr-only">Sign in</span>
        </Button>
      </form>
    </Form>
  )
}
