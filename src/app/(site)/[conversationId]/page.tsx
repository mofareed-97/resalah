import React from "react"

import MessageInput from "@/components/form/message-input"
import HeaderConversation from "@/components/header"
import MessagesList from "@/components/messages-list"
import { getConversationById, getMessages } from "@/app/_actions/conversation"

interface ConversationPageType {
  params: { conversationId: string }
}
export default async function ConversationPage({
  params,
}: ConversationPageType) {
  const conversation = await getConversationById(params.conversationId)
  const messages = await getMessages(params.conversationId)
  if (!conversation) {
    return (
      <div className="h-full w-full">
        <div className="flex h-full items-center justify-center">
          <h1 className="text-2xl font-bold">Conversation Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <section className="flex h-screen flex-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col bg-[url('/chat-bg-light.png')] dark:bg-[url('/chat-bg.png')]">
        <div className="absolute left-0 top-0 h-full w-full bg-background/50 dark:bg-background/90" />
        <HeaderConversation conversation={conversation} />
        {messages && messages.length ? (
          <MessagesList initialItems={messages} />
        ) : (
          <div className="flex-1"></div>
        )}
        <MessageInput conversationId={params.conversationId} />
      </div>

      {/* <UserDetails /> */}
    </section>
  )
}
