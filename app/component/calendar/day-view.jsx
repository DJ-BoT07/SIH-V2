import { motion } from "framer-motion"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

export function DayView({ date, events }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayEvents = events.filter(event => isSameDay(event.date, date))

  return (
    <div className="flex flex-col space-y-2">
      {hours.map((hour) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`
        const hourEvents = dayEvents.filter(event => {
          if (!event.time) return false
          const [eventHour] = event.time.split(':')
          return parseInt(eventHour) === hour
        })

        return (
          <motion.div
            key={hour}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hour * 0.02 }}
            className="group flex"
          >
            <div className="w-20 py-2 text-sm text-muted-foreground">
              {timeString}
            </div>
            <motion.div
              className={cn(
                "flex-1 border-l pl-4 py-2",
                "group-hover:bg-accent/50 transition-colors duration-200"
              )}
            >
              {hourEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={cn(
                    "rounded px-2 py-1 mb-1 cursor-pointer",
                    event.type === "festival" && "bg-green-500/20 text-green-500",
                    event.type === "birthday" && "bg-purple-500/20 text-purple-500",
                    event.type === "meeting" && "bg-blue-500/20 text-blue-500"
                  )}
                >
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs opacity-75">{event.time}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
} 