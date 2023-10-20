import React from "react"

import { cn } from "@/lib/utils"
import useActiveList from "@/hooks/useActiveList"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface IProps {
  url: string | null
  name?: string | null
  email?: string | null
  className?: string
}

function AvatarUser({ url, name, email = null, className }: IProps) {
  const initial = name?.charAt(0)
  const { members } = useActiveList()
  const isActive = email ? members.indexOf(email) !== -1 : false

  return (
    <div className="relative">
      {isActive ? (
        <div className="absolute -top-[0.5] right-0 z-10 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
      ) : null}
      <Avatar className={cn("h-10 w-10", className)}>
        <AvatarImage
          src={url ?? ""}
          alt={`${name ?? ""} avatar`}
          className="object-cover"
        />
        <AvatarFallback>{initial ?? ""}</AvatarFallback>
      </Avatar>
    </div>
  )
}

export default AvatarUser
