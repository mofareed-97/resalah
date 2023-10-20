import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { conversationSchema } from "@/lib/validation/conversation"
import { createConversation } from "@/app/_actions/conversation"

export default function useCreateConversation() {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  async function contactsHandler(input: z.infer<typeof conversationSchema>) {
    try {
      const conversation = await createConversation({
        isGroup: input.isGroup ?? false,
        members: input.members ? input.members : [],
        name: input.name ? input.name : "",
        userId: input.userId,
      })

      toast.success("Successfully created conversation")
      router.push(`/${conversation.id}`)
      return conversation
    } catch (error) {
      catchError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { contactsHandler, isLoading }
}
