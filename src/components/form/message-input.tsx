"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import {
  Link2Icon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons"
import { CldUploadButton } from "next-cloudinary"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { messageSchema } from "@/lib/validation/conversation"
import { createMessage } from "@/app/_actions/conversation"

import { Button } from "../ui/button"
import { IconSpinner } from "../ui/icons"
import { Input } from "../ui/input"

type InputSchemaType = z.infer<typeof messageSchema>

interface MessageInputProps {
  conversationId: string
}
function MessageInput({ conversationId }: MessageInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { handleSubmit, register, setValue } = useForm<InputSchemaType>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      image: null,
    },
  })

  async function onSubmit(formData: InputSchemaType) {
    setIsLoading(true)
    try {
      await createMessage({
        content: formData.content,
        image: formData.image ?? null,
        conversationId,
      })

      toast.success("Message sent successfully!")
      setValue("content", "", { shouldValidate: true })
      setValue("image", null, { shouldValidate: true })
    } catch (err: any) {
      catchError(err)
    } finally {
      setIsLoading(false)
    }
  }

  function uploadHandler(result: any) {}
  return (
    // <div className="absolute bottom-8 left-0 z-10 w-full px-6 ">
    <div className="sticky bottom-0 z-10 w-full p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          {...register("content")}
          className="bg-card py-5 pl-10 pr-20"
          placeholder="Write a message..."
          disabled={isLoading}
        />

        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
          <CldUploadButton
            options={{
              maxFiles: 1,
            }}
            onUpload={(result: any) => {
              setValue("image", result?.info?.secure_url)
            }}
            uploadPreset="tpxb8vjq"
          >
            <Link2Icon className="h-4 w-4" />
          </CldUploadButton>
          <Button
            disabled={isLoading}
            type="submit"
            variant={"default"}
            size={"icon"}
          >
            {isLoading ? (
              <IconSpinner />
            ) : (
              <PaperPlaneIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
