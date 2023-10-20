"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Conversation, User } from "@prisma/client"
import {
  ChevronLeftIcon,
  InfoCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import dayjs from "dayjs"
import { toast } from "sonner"

import { catchError } from "@/lib/utils"
import useChatUser from "@/hooks/useChatUser"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { deleteConversationById } from "@/app/_actions/conversation"

import AvatarUser from "./avatar-user"
import { IconSpinner } from "./ui/icons"
import { Separator } from "./ui/separator"

interface HeaderConversationProps {
  conversation: Conversation & { users: User[] }
}
export default function HeaderConversation({
  conversation,
}: HeaderConversationProps) {
  const user = useChatUser(conversation.users)
  const router = useRouter()

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} memebers`
    }

    return `Active`
  }, [])

  return (
    <div className="relative flex h-20 items-center justify-between bg-card p-6">
      <div className="flex items-center gap-4">
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => router.push("/")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <AvatarUser
          url={!conversation.isGroup ? user.image : conversation.image ?? null}
          name={conversation.isGroup ? conversation.name : user.name}
          email={conversation.isGroup ? null : user.email}
        />
        <div className="">
          <h2 className="font-bold">
            {conversation.isGroup ? conversation.name : user.name}
          </h2>
          {conversation.isGroup ? (
            <div className="mt-2 flex items-center">
              {conversation.users.map((user) => {
                return (
                  <AvatarUser
                    url={user.image}
                    name={user.name}
                    email={user.email}
                    key={user.id}
                    className="h-6 w-6"
                  />
                )
              })}
            </div>
          ) : (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {statusText}
            </p>
          )}
        </div>
      </div>
      <ConversationInfo user={user} conversation={conversation} />
    </div>
  )
}

export function ConversationInfo({
  user,
  conversation,
}: {
  user: User
  conversation: Conversation
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function deleteConversation() {
    setIsLoading(true)
    try {
      await deleteConversationById(conversation.id)
      toast.success("Conversation deleted successfully")
      router.push("/")
    } catch (err) {
      catchError(err)
    } finally {
      setIsOpen(false)
      setIsLoading(false)
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="" variant={"outline"} size={"icon"}>
          <InfoCircledIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col items-center gap-2 py-10">
          <AvatarUser
            url={
              !conversation.isGroup ? user.image : conversation.image ?? null
            }
            name={conversation.isGroup ? conversation.name : user.name}
            email={conversation.isGroup ? null : user.email}
            className="h-12 w-12"
          />
          <h2 className="my-3 text-lg">
            {conversation.isGroup ? conversation.name : user.name}
          </h2>
          <div className="my-6 w-full">
            <div className="mb-2 w-full space-y-2 text-muted-foreground">
              <span className="text-sm">
                {conversation.isGroup ? "Created By" : "Email"}
              </span>
              <p className="text-sm">
                {conversation.isGroup ? user.name : user.email}
              </p>
              <Separator />
            </div>
            <div className="w-full space-y-2 text-muted-foreground">
              <span className="text-sm">
                {conversation.isGroup ? "Created At" : "Joined"}
              </span>
              <p className="text-sm">
                {dayjs(user.createdAt).format("MMMM D, YYYY")}
              </p>
              <Separator />
            </div>
          </div>
        </div>
        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={"destructive"}
                className="flex w-full items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <IconSpinner />
                ) : (
                  <>
                    {conversation.isGroup
                      ? "Delete Group"
                      : "Delete Conversation"}
                    <TrashIcon className="h-5 w-5" />
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to remove the conversation?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your conversation from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteConversation}
                  className="w-24"
                >
                  {isLoading ? <IconSpinner /> : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
