import { cn } from "@/lib/utils"
import { addDays, format, startOfWeek } from "date-fns"
import { motion } from "framer-motion"

export function CalendarGrid({ date, selectedDate, events, onDateSelect }) {
  const startDate = startOfWeek(date)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <motion.div 
      layout
      className="grid grid-cols-7 gap-px bg-gray-800"
    >
      {weekDays.map((day) => (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-2 text-sm font-medium text-gray-400"
        >
          {day}
        </motion.div>
      ))}
      {Array.from({ length: 42 }).map((_, i) => {
        const currentDate = addDays(startDate, i)
        const dayEvents = events.filter(
          (event) =>
            format(event.date, "yyyy-MM-dd") ===
            format(currentDate, "yyyy-MM-dd")
        )
        const isCurrentMonth = format(currentDate, "MM") === format(date, "MM")
        const isSelected = selectedDate && format(currentDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: i * 0.01,
              duration: 0.2,
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 },
              backgroundColor: "rgba(17, 17, 17, 1)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              zIndex: 10
            }}
            onClick={() => onDateSelect && onDateSelect(currentDate)}
            className={cn(
              "relative min-h-[120px] bg-gray-900 p-2 transition-colors duration-200 cursor-pointer",
              !isCurrentMonth && "bg-gray-900/50 text-gray-600",
              "hover:border-blue-500/50 hover:bg-gray-800",
              isSelected && "ring-2 ring-blue-500"
            )}
          >
            <motion.div 
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                !isCurrentMonth ? "text-gray-600" : "font-medium",
                dayEvents.length > 0 && "bg-blue-500/20 text-blue-500",
                isSelected && "bg-blue-500 text-blue-500-foreground"
              )}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(var(--blue-500), 0.15)",
              }}
            >
              {format(currentDate, "d")}
            </motion.div>
            <motion.div 
              className="mt-1 space-y-1"
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {dayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 },
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  className={cn(
                    "cursor-pointer rounded px-1.5 py-0.5 text-xs transition-all",
                    event.type === "festival" && "bg-green-500/20 text-green-500 hover:bg-green-500/30",
                    event.type === "birthday" && "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
                    event.type === "meeting" && "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                  )}
                >
                  {event.time && <span className="mr-1">{event.time}</span>}
                  {event.title}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
