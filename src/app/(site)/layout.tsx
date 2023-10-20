import { redirect } from "next/navigation"

import { Inbox } from "@/components/inbox"
import Sidebar from "@/components/sidebar"

import { getConversations } from "../_actions/conversation"
import getCurrentUser from "../_actions/getCurrentUser"
import { getUsers } from "../_actions/user"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user?.id || !user.email) {
    redirect("/signin")
  }

  const users = await getUsers()
  const conversations = await getConversations()

  const groupConversatios = conversations.filter(
    (conversation) => conversation.isGroup
  )
  return (
    <main className="flex h-screen">
      <Sidebar user={user} otherUsers={users} groups={groupConversatios} />
      <Inbox users={users} currentUser={user} initialItems={conversations} />
      {children}
    </main>
  )
}
