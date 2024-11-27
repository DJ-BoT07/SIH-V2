import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

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
    const load = Math.round(adjustedLoad * randomFactor);

    return {
      time: `${hour}:00`,
      load,
      solar: Math.round(8000 * solarFactor * random(0.8, 1.2, seed + i + 24)),
      isOverload: load > 15000
    };
  });
};

const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;
  
  if (payload.isOverload) {
    return (
      <svg x={cx - 5} y={cy - 5} width={10} height={10}>
        <circle
          cx="5"
          cy="5"
          r="4"
          fill="#ff4d4f"
          stroke="#fff"
        />
      </svg>
    );
  }

  return null;
};

const CustomizedXAxisTick = (props) => {
  const { x, y, payload, data } = props;
  const timeData = data.find(d => d.time === payload.value);
  const isOverload = timeData?.isOverload;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={isOverload ? "#ff4d4f" : "#fff"}
        className={isOverload ? "font-bold" : ""}
      >
        {payload.value}
      </text>
      {isOverload && (
        <path
          d="M-20,25 L20,25"
          stroke="#ff4d4f"
          strokeWidth="2"
        />
      )}
    </g>
  );
};

export default function CurrentLoadChart({ date }) {
  const [area, setArea] = useState("BSES Rajdhani Power Limited");

  const newDelhiDuckCurveData = useMemo(() => generateRandomData(date, area), [date, area]);
  const averageLoad = Math.round(newDelhiDuckCurveData.reduce((sum, data) => sum + data.load, 0) / newDelhiDuckCurveData.length);
  const peakLoad = Math.max(...newDelhiDuckCurveData.map(data => data.load));
  const peakTimes = newDelhiDuckCurveData
    .filter(data => data.load > 15000)
    .map(data => data.time)
    .join(", ");

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
      <motion.div className="text-center mb-4">
        <motion.p 
          className="text-lg sm:text-xl font-semibold text-white"
          variants={itemVariants}
        >
          Average Load: {averageLoad} MW
        </motion.p>
        <motion.p 
          className="text-lg sm:text-xl font-semibold text-white"
          variants={itemVariants}
        >
          Peak Load: {peakLoad} MW
        </motion.p>
        {peakTimes && (
          <motion.p 
            className="text-base text-red-400 mt-1"
            variants={itemVariants}
          >
            Load exceeded 15000 MW at: {peakTimes}
          </motion.p>
        )}
      </motion.div>
      
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
              <XAxis 
                dataKey="time" 
                tick={<CustomizedXAxisTick data={newDelhiDuckCurveData} />}
                height={60}
              />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#333', 
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'load' && value > 15000) {
                    return [value + ' MW (Overload)', name];
                  }
                  return [value + (name === 'load' ? ' MW' : ' W'), name];
                }}
              />
              <Legend />
              {newDelhiDuckCurveData.map((entry, index) => (
                entry.isOverload && (
                  <ReferenceLine
                    key={index}
                    x={entry.time}
                    stroke="#ff4d4f"
                    strokeDasharray="3 3"
                    label={{
                      value: "Overload",
                      fill: "#ff4d4f",
                      position: "top"
                    }}
                  />
                )
              ))}
              <Line 
                type="monotone" 
                dataKey="load" 
                name="Load"
                stroke="#8884d8" 
                strokeWidth={3}
                dot={<CustomizedDot />}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="solar" 
                name="Solar Generation"
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

