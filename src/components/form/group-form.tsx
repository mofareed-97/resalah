"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { CheckIcon, PlusCircledIcon, UploadIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { groupSchema } from "@/lib/validation/conversation"
import useCreateConversation from "@/hooks/useCreateConversation"
import { Button } from "@/components/ui/button"
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
import { createConversation } from "@/app/_actions/conversation"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { IconPlus, IconSpinner } from "../ui/icons"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface GroupFormProps {
  users: User[]
  user: User
}

export function GroupForm({ users, user }: GroupFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
  })

  async function onSubmit(values: z.infer<typeof groupSchema>) {
    setIsLoading(true)
    if (selectedUsers.length < 1) {
      return toast.error("Please select at least one user")
    }

    try {
      await createConversation({
        userId: user.id,
        isGroup: true,
        members: [...selectedUsers.map((user) => user.id)],
        name: values.name,
      })

      toast.success(`created ${values.name} group successfully!`)
      router.refresh()
      setOpen(false)
    } catch (err: any) {
      catchError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-10 w-10 cursor-pointer rounded-full p-0 transition duration-500 hover:scale-110"
              onClick={() => setOpen(true)}
            >
              <IconPlus className="h-6 w-6" />
              <span className="sr-only">Create group</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={10}>Create new group</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-fit">
              <DialogHeader className="px-4 pb-4 pt-5">
                <DialogTitle>New Group</DialogTitle>
                <DialogDescription>
                  Invite a users to this group. This will create a new group
                  message.
                </DialogDescription>
                <Separator />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Group name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DialogHeader>
              <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
                <CommandInput placeholder="Search user..." />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup className="p-2">
                    {users.map((user) => (
                      <CommandItem
                        key={user.email}
                        className="flex items-center px-2"
                        onSelect={() => {
                          if (selectedUsers.includes(user)) {
                            return setSelectedUsers(
                              selectedUsers.filter(
                                (selectedUser) => selectedUser !== user
                              )
                            )
                          }

                          return setSelectedUsers(
                            [...users].filter((u) =>
                              [...selectedUsers, user].includes(u)
                            )
                          )
                        }}
                      >
                        <Avatar>
                          <AvatarImage src={user.image!} alt="Image" />
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-2">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        {selectedUsers.includes(user) ? (
                          <CheckIcon className="ml-auto flex h-5 w-5 text-primary" />
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
                {selectedUsers.length > 0 ? (
                  <div className="flex -space-x-2 overflow-hidden">
                    {selectedUsers.map((user) => (
                      <Avatar
                        key={user.email}
                        className="inline-block border-2 border-background"
                      >
                        <AvatarImage src={user.image!} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select users to add to this thread.
                  </p>
                )}
                <Button
                  disabled={isLoading || selectedUsers.length < 1}
                  type="submit"
                  className="w-24"
                >
                  {isLoading ? <IconSpinner /> : "Continue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
