"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ru } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-transparent", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-[0.5px] border-zinc-700"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-zinc-500",
        row: "flex w-full mt-2",
        cell: cn(
          "h-8 w-8 text-center text-sm p-0 relative",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-zinc-800/50",
          "[&:has([aria-selected])]:bg-zinc-800"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-zinc-800/50 transition-colors duration-200",
          "rounded-sm",
          "focus:bg-zinc-800/50 focus:text-zinc-400",
          "data-[selected]:bg-zinc-900/50 data-[selected]:text-zinc-400"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-400 focus:bg-zinc-900/50 focus:text-zinc-400",
        day_today: "bg-zinc-800/30 text-zinc-400",
        day_outside:
          "text-zinc-500 opacity-50 aria-selected:bg-zinc-800/30 aria-selected:text-zinc-400 aria-selected:opacity-30",
        day_disabled: "text-zinc-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-zinc-800/30 aria-selected:text-zinc-400",
        day_hidden: "invisible",
        ...classNames,
      }}
      // components={{
      //   IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
      //   IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      // }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
