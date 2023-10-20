"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { GearIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUser } from "@/app/_actions/user"

import { IconSpinner } from "../ui/icons"
import { Separator } from "../ui/separator"

interface IProps {
  user: User
}

const profileValidation = z.object({
  name: z.string().min(3),
})
export function UpdateProfile({ user }: IProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { register, handleSubmit } = useForm<z.infer<typeof profileValidation>>(
    {
      resolver: zodResolver(profileValidation),
      defaultValues: {
        name: user.name ?? "",
      },
    }
  )

  async function onSubmit(data: z.infer<typeof profileValidation>) {
    setIsLoading(true)
    try {
      await updateUser(data.name)
      toast.success("profile updated successfully")
      window.location.reload()
      setOpen(false)
    } catch (error) {
      catchError(error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <GearIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 py-4">
          <Label htmlFor="name" className="">
            Name
          </Label>
          <Input id="name" {...register("name")} className="col-span-3" />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <IconSpinner className="mr-2" /> : null} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
