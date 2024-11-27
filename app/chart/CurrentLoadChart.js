import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from 'next/navigation';
import { parse } from 'date-fns';

const areas = [
  "BSES Rajdhani Power Limited",
  "BSES Yamuna Power Limited",
  "Tata Power Delhi Distribution Limited",
  "New Delhi Municipal Council"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const generateRandomData = (date, area) => {
  const seed = date.getTime() + area.length;
  const random = (min, max, seed) => {
    const x = Math.sin(seed) * 10000;
    return ((x - Math.floor(x)) * (max - min) + min);
  };

  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const baseLoad = 15000 + 5000 * Math.sin((hour - 6) * Math.PI / 12);
    const randomFactor = random(0.9, 1.1, seed + i);
    const solarFactor = hour >= 6 && hour <= 18 ? Math.sin((hour - 6) * Math.PI / 12) : 0;
    
    const adjustedLoad = baseLoad - (solarFactor * 8000 * random(0.8, 1.2, seed + i + 24));

    return {
      time: `${hour}:00`,
      load: Math.round(adjustedLoad * randomFactor),
      solar: Math.round(8000 * solarFactor * random(0.8, 1.2, seed + i + 24)),
    };
  });
};

export default function CurrentLoadChart({ date }) {
  const searchParams = useSearchParams();
  const [area, setArea] = useState("BSES Rajdhani Power Limited");

  const newDelhiDuckCurveData = useMemo(() => generateRandomData(date, area), [date, area]);
  const averageLoad = Math.round(newDelhiDuckCurveData.reduce((sum, data) => sum + data.load, 0) / newDelhiDuckCurveData.length);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full h-full"
    >
      <motion.h2 
        className="text-center text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white"
        variants={itemVariants}
      >
        New Delhi Electricity Load - Duck Curve Effect
      </motion.h2>
      <motion.p 
        className="text-center text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white"
        variants={itemVariants}
      >
        Average Load: {averageLoad} MW
      </motion.p>
      
      <motion.div 
        className="flex flex-col lg:flex-row gap-4"
        variants={containerVariants}
      >
        <motion.div 
          className="w-full lg:w-3/4"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <ResponsiveContainer width="100%" height={400} minWidth={300}>
            <LineChart data={newDelhiDuckCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#333', 
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="load" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="solar" 
                stroke="#ffc658" 
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div 
          className="w-full lg:w-1/4 flex flex-col justify-center items-start"
          variants={itemVariants}
        >
          <motion.div 
            className="flex flex-col gap-2 border-2 border-white p-2 rounded-md w-full"
            whileHover={{ scale: 1.02 }}
          >
            <Select onValueChange={setArea}>
              <SelectTrigger className="transition-all duration-300 hover:bg-background/80">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                <AnimatePresence>
                  {areas.map((area, index) => (
                    <motion.div
                      key={area}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SelectItem value={area}>{area}</SelectItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

