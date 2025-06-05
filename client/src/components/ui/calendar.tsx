"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "../ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 rounded-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-6 sm:space-y-0",
        month: "bg-white rounded-lg shadow border p-4 space-y-4 min-w-[260px] relative",
        caption: "flex justify-center pt-1 relative items-center px-2 mb-2",
        caption_label: "text-base font-semibold text-gray-800",
        nav: "space-x-1 flex items-center absolute left-0 top-1/2 -translate-y-1/2 ml-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 hover:bg-gray-100 transition-colors rounded-full border border-gray-300"
        ),
        nav_button_previous: "",
        nav_button_next: "ml-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-semibold text-[0.9rem] py-2",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-green-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-green-50 hover:text-green-800"
        ),
        day_range_end: "day-range-end bg-green-200",
        day_selected:
          "bg-green-600 text-white hover:bg-green-700 hover:text-white focus:bg-green-700 focus:text-white rounded-full",
        day_today: "border-2 border-green-500 text-green-800 font-bold rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-70",
        day_disabled: "text-muted-foreground opacity-20",
        day_range_middle:
          "aria-selected:bg-green-100 aria-selected:text-green-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }