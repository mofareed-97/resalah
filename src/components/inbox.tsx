"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ConversationType } from "@/types"
import { User } from "@prisma/client"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { find } from "lodash"
import { useSession } from "next-auth/react"

import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import useConversation from "@/hooks/useConversation"

import ConversationBox from "./conversation-box"
import { ContactsModal } from "./form/contacts-modal"
import { UpdateProfile } from "./form/update-profile"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"

interface InboxProps {
  users: User[]
  initialItems: ConversationType[]
  currentUser: User
}
export function Inbox({ users, initialItems, currentUser }: InboxProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState(initialItems)
  const router = useRouter()

  const { conversationId, isOpen } = useConversation()
  const pusherKey = useMemo(() => session?.user.email, [session?.user.email])

  useEffect(() => {
    if (!pusherKey) return

    pusherClient.subscribe(pusherKey)

    const updateHandler = (conversation: ConversationType) => {
      setConversations((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            }
          }

          return currentConversation
        })
      )
    }

    const newHandler = (conversation: ConversationType) => {
      setConversations((current) => {
        if (find(current, { id: conversation.id })) {
          return current
        }

        return [conversation, ...current]
      })
    }

    const removeHandler = (conversation: ConversationType) => {
      setConversations((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)]
      })
      if (conversationId === conversation.id) {
        router.push("/")
      }
    }

    pusherClient.bind("conversation:update", updateHandler)
    pusherClient.bind("conversation:new", newHandler)
    pusherClient.bind("conversation:remove", removeHandler)

    return () => {
      pusherClient.unsubscribe(pusherKey)
      pusherClient.unbind("conversation:update", updateHandler)
      pusherClient.unbind("conversation:new", newHandler)
      pusherClient.unbind("conversation:remove", removeHandler)
    }
  }, [pusherKey, router])

  return (
    <section
      className={cn(
        "h-screen w-full overflow-hidden border-r bg-card py-6 lg:block lg:w-96",
        isOpen ? "hidden" : "block"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between px-4">
          <h2 className="text-lg font-bold">Inbox</h2>
          <div className="flex items-center gap-1">
            <ContactsModal users={users} />
            <UpdateProfile user={currentUser} />
          </div>
        </div>

        <div className="relative mb-6 px-4">
          <Input placeholder="Search..." />
          <MagnifyingGlassIcon className="absolute right-6 top-2 h-5 w-5" />
        </div>
        <ScrollArea className="flex-1 overflow-y-auto px-2 pb-10">
          <div className="flex flex-col">
            {conversations.length
              ? conversations.map((conversation) => {
                  if (conversation.isGroup) return null
                  return (
                    <ConversationBox
                      key={conversation.id}
                      conversation={conversation}
                      selected={conversationId === conversation.id}
                    />
                  )
                })
              : null}
          </div>
        </ScrollArea>
      </div>
    </section>
  )
}
