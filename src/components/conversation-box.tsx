"use client"

import React from "react"
import Link from "next/link"
import { ConversationType } from "@/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import useChatUser from "@/hooks/useChatUser"

import AvatarUser from "./avatar-user"

dayjs.extend(relativeTime)

interface ConversationBoxProps {
  conversation: ConversationType
  selected?: boolean
}
export default function ConversationBox({
  conversation,
  selected = false,
}: ConversationBoxProps) {
  const otherUser = useChatUser(conversation.users)
  const { data: session } = useSession()

  const lastMessage = React.useMemo(() => {
    const messages = conversation.messages || []

    return messages[messages.length - 1]
  }, [conversation.messages])

  const hasSeen = React.useMemo(() => {
    if (!lastMessage || !session?.user.email) {
      return false
    }
    const seenArray = lastMessage.seen || []

    return (
      seenArray.filter((el) => el.email === session.user.email).length !== 0
    )
  }, [session?.user.email, lastMessage])

  const lastMessageText = React.useMemo(() => {
    if (lastMessage?.image) {
      return "Sent an image"
    }

    if (lastMessage?.content) {
      return lastMessage.content
    }

    return "Started a conversation"
  }, [lastMessage])

  return (
    <Link href={conversation.id}>
      <div
        className={cn(
          "flex cursor-pointer justify-between gap-2 rounded-lg px-2 py-4 duration-300 hover:bg-accent",
          selected ? "bg-accent" : ""
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative mr-2">
            <AvatarUser
              url={otherUser.image}
              name={otherUser.name}
              email={otherUser.email}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{otherUser.name}</h3>
            <p
              className={cn(
                "line-clamp-1 text-xs",
                hasSeen ? "text-muted-foreground" : "font-bold text-foreground"
              )}
            >
              {lastMessageText}
            </p>
          </div>
        </div>

        <div className="">
          <p className="whitespace-nowrap text-xs">
            {lastMessage?.createdAt
              ? dayjs().from(new Date(lastMessage.createdAt), true) + " ago"
              : ""}
          </p>
          {/* {hasSeen ? (
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-primary" />
          ) : null} */}
        </div>
      </div>
    </Link>
  )
}
