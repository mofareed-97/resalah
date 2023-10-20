"use client"

import React from "react"
import { MessageType } from "@/types"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { find } from "lodash"
import { useSession } from "next-auth/react"

import { pusherClient } from "@/lib/pusher"
import useConversation from "@/hooks/useConversation"
import { getSeenMessages } from "@/app/_actions/conversation"

import MessageBox from "./message-box"

interface MessageListProps {
  initialItems: MessageType[]
}
export default function MessagesList({ initialItems }: MessageListProps) {
  const [messages, setMessages] = React.useState(initialItems)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const { conversationId } = useConversation()
  const { data: session } = useSession()

  async function seenMessages() {
    try {
      await getSeenMessages(conversationId)
    } catch (error) {
      console.log(error)
    }
  }
  React.useEffect(() => {
    seenMessages()
  }, [conversationId])

  React.useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef.current?.scrollIntoView({})

    function messageHandler(message: MessageType) {
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current
        }

        return [...current, message]
      })

      bottomRef.current?.scrollIntoView({})

      seenMessages()
    }

    function updateMessageHandler(newMessage: MessageType) {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage
          }

          return currentMessage
        })
      )
    }

    pusherClient.bind("messages:new", messageHandler)
    pusherClient.bind("message:update", updateMessageHandler)

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind("messages:new", messageHandler)
      pusherClient.unbind("message:update", updateMessageHandler)
    }
  }, [conversationId])

  return (
    <ScrollArea className="relative flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 px-4 pt-4">
        {messages.map((message, i) => {
          return (
            <MessageBox
              key={message.id}
              isLast={i === messages.length - 1}
              message={message}
              isOwn={session?.user.email === message.sender.email}
            />
          )
        })}
        <div ref={bottomRef} className="pt-20" />
      </div>
    </ScrollArea>
  )
}
