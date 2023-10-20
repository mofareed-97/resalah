"use client"

import React from "react"
import Image from "next/image"
import { MessageType } from "@/types"
import { CheckIcon } from "@radix-ui/react-icons"
import dayjs from "dayjs"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface IProps {
  message: MessageType
  isOwn: boolean
  isLast: boolean
}
function MessageBox({ message, isOwn = false, isLast }: IProps) {
  const seenList = message.seen
    .filter((user) => user.email !== message.sender.email)
    .map((user) => user.name)
    .join(", ")
  return (
    <div
      className={cn(
        "flex  items-end  gap-3",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={message.sender.image ?? ""}
          alt={message.sender.name + "photo"}
        />
        <AvatarFallback>{message.sender.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "min-h-[40px] min-w-[100px] max-w-[350px] overflow-hidden rounded-lg rounded-bl-none border bg-card p-3",
            isOwn ? "bg-secondary" : "bg-card "
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-xs font-bold">{message.sender.name}</h3>
            <span className="text-xs text-muted-foreground">
              {dayjs(message.createdAt).format("H:MM A")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{message.content}</p>
          {message.image ? (
            <div className="relative mt-3 h-64 w-96 overflow-hidden rounded-lg">
              <Image
                src={message.image}
                alt="message"
                fill
                className="h-full w-full overflow-hidden rounded-lg object-cover"
              />
            </div>
          ) : null}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div className="flex items-center -space-x-2 text-gray-500">
            <CheckIcon className="h-4 w-4" />
            <CheckIcon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBox
