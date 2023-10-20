import React from "react"

import { IconSpinner } from "@/components/ui/icons"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-1 overflow-hidden">
      <div className="flex-1">
        <div className="flex h-20 items-center justify-between bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="relative flex flex-col justify-between  pb-6">
          <div className="flex h-[calc(90vh_-_80px)] items-center justify-center overflow-y-scroll">
            <IconSpinner className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
