"use client"

import { useMemo } from "react"
import { ConversationType } from "@/types"
import { User } from "@prisma/client"
import { useSession } from "next-auth/react"

export default function useChatUser(users: User[]) {
  const { data: session } = useSession()

  const otherUser = useMemo(() => {
    const currentUserEmail = session?.user.email

    const filterUsers = users.filter((user) => user.email !== currentUserEmail)

    return filterUsers[0]
  }, [session?.user.email, users])

  return otherUser
}
