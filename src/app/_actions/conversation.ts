"use server"

import { Conversation } from "@prisma/client"
import { z } from "zod"

import db from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import {
  conversationSchema,
  messageSchema,
} from "@/lib/validation/conversation"

import getCurrentUser from "./getCurrentUser"

export async function getConversations() {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    return []
  }

  try {
    const conversations = await db.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },

      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    })

    return conversations
  } catch (err: any) {
    return []
  }
}

export async function createConversation(
  input: z.infer<typeof conversationSchema>
) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id || !currentUser?.email) {
    throw new Error("Unautorized")
  }
  const { isGroup, userId, members, name } = input

  try {
    if (isGroup && (!members || members.length < 1 || !name)) {
      throw new Error("Invalid data")
    }

    if (isGroup && members) {
      const newGroupConversation = await db.conversation.create({
        data: {
          isGroup,
          name,
          users: {
            connect: [
              ...members.map((member) => ({
                id: member,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      })

      newGroupConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(
            user.email,
            "conversation:new",
            newGroupConversation
          )
        }
      })

      return newGroupConversation
    }

    const exisitingConversations = await db.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    })

    const singleConversation = exisitingConversations[0]

    if (singleConversation) {
      return singleConversation
    }

    const newConversation = await db.conversation.create({
      data: {
        isGroup: false,
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    })

    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation)
      }
    })
    return newConversation
  } catch (err: any) {
    throw new Error(err)
  }
}

export async function getConversationById(conversationId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    return null
  }

  try {
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    })

    return conversation
  } catch (error) {
    return null
  }
}

export async function deleteConversationById(conversationId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    return null
  }

  try {
    const exisitingConversations = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    })

    if (!exisitingConversations) {
      throw new Error("conversation not found")
    }

    const conversation = await db.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    })

    exisitingConversations.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(
          user.email,
          "conversation:remove",
          exisitingConversations
        )
      }
    })

    return conversation
  } catch (err: any) {
    throw new Error(err)
  }
}

export async function getMessages(conversationId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    return null
  }

  try {
    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        seen: true,
        sender: true,
      },
    })

    return messages
  } catch (error) {}
}

export async function createMessage(
  input: z.infer<typeof messageSchema> & { conversationId: string }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    throw new Error("Unautorized")
  }

  const { content, image, conversationId } = input

  try {
    const newMessage = await db.message.create({
      data: {
        content,
        image: image ?? null,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },

        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    })

    const updateConversation = await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: { seen: true },
        },
      },
    })

    await pusherServer.trigger(conversationId, "messages:new", newMessage)

    const lastMessage =
      updateConversation.messages[updateConversation.messages.length - 1]

    updateConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      })
    })

    return newMessage
  } catch (err: any) {
    throw new Error(err)
  }
}

export async function getSeenMessages(conversationId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.email || !currentUser.id) {
    return null
  }

  try {
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    })

    if (!conversation) {
      throw new Error("Invalid ID")
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1]

    if (!lastMessage) {
      return conversation
    }

    const updatedMessage = await db.message.update({
      where: {
        id: lastMessage.id,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        sender: true,
        seen: true,
      },
    })

    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    })

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return conversation
    }

    await pusherServer.trigger(
      conversationId!,
      "message:update",
      updatedMessage
    )

    return updatedMessage
  } catch (error) {
    throw new Error("Something went wrong")
  }
}
