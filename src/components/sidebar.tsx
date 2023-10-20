"use client"

import React from "react"
import Link from "next/link"
import { ConversationType } from "@/types"
import { User } from "@prisma/client"
import { BellIcon, PlusIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import useConversation from "@/hooks/useConversation"

import { SignOutDialog } from "./auth/signout"
import AvatarUser from "./avatar-user"
import { GroupForm } from "./form/group-form"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import PingCircle from "./ui/ping-circle"
import { ScrollArea } from "./ui/scroll-area"

interface SidebarProps {
  user: User
  otherUsers: User[]
  groups: ConversationType[]
}
export default function Sidebar({ user, otherUsers, groups }: SidebarProps) {
  const { isOpen } = useConversation()
  return (
    <section
      className={cn(
        "w-24 flex-col items-center justify-between border-r bg-card py-6  shadow-2xl lg:flex ",
        isOpen ? "hidden" : "flex"
      )}
    >
      <ScrollArea className="w-full flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 pb-3">
          {groups && groups.length > 0
            ? groups.map((group) => {
                return <GroupBox key={group.id} group={group} />
              })
            : null}
          <GroupForm users={otherUsers} user={user} />
        </div>
      </ScrollArea>
      <div className="flex flex-col items-center gap-2 px-4">
        <ModeToggle />
        <Button size={"icon"} variant={"ghost"} className="relative">
          <BellIcon className="h-4 w-4" />
          <div className="absolute right-2 top-2">
            <PingCircle />
          </div>
        </Button>
        <SignOutDialog />
        <AvatarUser
          url={user?.image ?? null}
          name={user?.name}
          email={user.email}
        />
      </div>
    </section>
  )
}

function GroupBox({ group }: { group: ConversationType }) {
  return (
    <Link href={group.id} className="transition duration-500 hover:scale-110">
      <AvatarUser url={group.image} name={group.name} />
    </Link>
  )
}
