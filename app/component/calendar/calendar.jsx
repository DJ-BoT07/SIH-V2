"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { addMonths, format, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarGrid } from "./calendar-grid"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { YearView } from "./year-view"

const sampleEvents = [
  {
    id: "1",
    title: "Diwali(Deepawali)", 
    date: new Date(2024, 10, 1),
    type: "festival"
  },
  {
    id: "2",
    title: "Govardhan Puja",
    date: new Date(2024, 10, 2),
    type: "festival"
  },
  {
    id: "3",
    title: "Session for Cohort 2",
    date: new Date(2024, 10, 5),
    time: "6:30 PM",
    type: "meeting"
  },
  {
    id: "4",
    title: "Guru Nanak Jayanti",
    date: new Date(2024, 10, 15),
    type: "festival"
  },
  {
    id: "5",
    title: "Team Planning Meeting",
    date: new Date(2024, 10, 7),
    time: "10:00 AM",
    type: "meeting"
  },
  {
    id: "6",
    title: "Project Deadline",
    date: new Date(2024, 10, 10),
    time: "5:00 PM",
    type: "deadline"
  },
  {
    id: "7",
    title: "Christmas",
    date: new Date(2024, 11, 25),
    type: "festival"
  },
  {
    id: "8",
    title: "New Year's Eve",
    date: new Date(2024, 11, 31),
    type: "festival"
  },
  {
    id: "9",
    title: "Quarterly Review",
    date: new Date(2024, 10, 20),
    time: "2:00 PM",
    type: "meeting"
  },
  {
    id: "10",
    title: "Team Building Event",
    date: new Date(2024, 10, 25),
    time: "3:00 PM",
    type: "event"
  }
]

export function Calendar() {
  const [date, setDate] = React.useState(new Date(2024, 10))
  const [view, setView] = React.useState("month")

  const handleNavigate = (direction) => {
    switch (view) {
      case "day":
        setDate(direction === "next" ? addDays(date, 1) : subDays(date, 1))
        break
      case "week":
        setDate(direction === "next" ? addWeeks(date, 1) : subWeeks(date, 1))
        break
      case "month":
        setDate(direction === "next" ? addMonths(date, 1) : subMonths(date, 1))
        break
      case "year":
        setDate(direction === "next" ? addYears(date, 1) : subYears(date, 1))
        break
    }
  }

  const getDateRangeText = () => {
    switch (view) {
      case "day":
        return format(date, "MMMM d, yyyy")
      case "week":
        const weekStart = startOfWeek(date)
        const weekEnd = endOfWeek(date)
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      case "month":
        return format(date, "MMMM yyyy")
      case "year":
        return format(date, "yyyy")
      default:
        return ""
    }
  }

  const renderView = () => {
    switch (view) {
      case "day":
        return <DayView date={date} events={sampleEvents} />
      case "week":
        return <WeekView date={date} events={sampleEvents} />
      case "month":
        return <CalendarGrid date={date} events={sampleEvents} />
      case "year":
        return <YearView date={date} events={sampleEvents} />
      default:
        return null
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-screen flex-col bg-background text-foreground"
    >
      <motion.header 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between border-b px-6 py-3"
      >
        <div className="flex items-center gap-4">
          <motion.h1 
            layout
            className="text-xl font-semibold min-w-[200px]"
          >
            {getDateRangeText()}
          </motion.h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex">
            {["day", "week", "month", "year"].map((v) => (
              <motion.div
                key={v}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={view === v ? "secondary" : "ghost"}
                  className="text-sm"
                  onClick={() => setView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search"
              className="w-64 pl-8"
            />
          </motion.div>
        </div>
      </motion.header>
      <motion.main 
        layout
        className="flex-1 overflow-auto p-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${date.toString()}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </motion.div>
  )
}
