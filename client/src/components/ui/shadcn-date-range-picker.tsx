"use client"

import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface ShadcnDateRangePickerProps {
  value: DateRange
  onChange: (value: DateRange) => void
  className?: string
}

export function ShadcnDateRangePicker({ value, onChange, className }: ShadcnDateRangePickerProps) {
  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from
              ? value.to
                ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
                : format(value.from, "LLL dd, y")
              : <span>Pick a date range</span>
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            initialFocus
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 