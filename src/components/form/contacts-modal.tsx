"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import {
  ChatBubbleIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons"

import useCreateConversation from "@/hooks/useCreateConversation"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { IconSpinner } from "../ui/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface ContactsModal {
  users: User[]
}
export function ContactsModal({ users }: ContactsModal) {
  const [open, setOpen] = useState(false)
  const { contactsHandler, isLoading } = useCreateConversation()

  function onSubmit(user: User) {
    contactsHandler({
      userId: user.id,
    }).then(() => setOpen(false))
  }

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
              <PlusCircledIcon className="h-5 w-5" />
              <span className="sr-only">new conversation </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={10}>New conversation</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>
              Start a new conversation with user
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="p-2">
                {users.map((user) => (
                  <CommandItem
                    key={user.email}
                    className="flex items-center justify-between px-2"
                  >
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage src={user.image!} alt="Image" />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() => onSubmit(user)}
                    >
                      {isLoading ? (
                        <IconSpinner />
                      ) : (
                        <ChatBubbleIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
