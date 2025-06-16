
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  buttonClassName?: string;
  icon?: React.ReactNode;
  placeholderText?: string;
  disabled?: (date: Date) => boolean; 
}

export function DatePicker({ 
  date, 
  setDate, 
  buttonClassName, 
  icon = <CalendarIcon className="mr-2 h-4 w-4" />, 
  placeholderText = "Pick a date",
  disabled
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            buttonClassName
          )}
        >
          {icon}
          {date ? format(date, "PPP") : <span>{placeholderText}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
