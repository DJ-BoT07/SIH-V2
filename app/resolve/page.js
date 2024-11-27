'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from "recharts";

// Function to generate optimal buying slots
const generateOptimalSlots = (date, peakLoad) => {
  const seed = date.getTime();
  const random = (min, max, seed) => {
    const x = Math.sin(seed) * 10000;
    return ((x - Math.floor(x)) * (max - min) + min);
  };

  // Generate 24-hour data with prices and demand
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const basePrice = 5 + 2 * Math.sin((hour - 6) * Math.PI / 12); // Price varies throughout day
    const price = basePrice * random(0.8, 1.2, seed + hour);
    const demand = peakLoad * random(0.7, 1.1, seed + hour + 24);
    
    return {
      hour: `${hour}:00`,
      price: Math.round(price * 100) / 100,
      demand: Math.round(demand),
      isOptimal: price < basePrice && demand < peakLoad
    };
  });

  return hourlyData;
};

// Calculate potential savings
const calculateSavings = (slots) => {
  const avgPrice = slots.reduce((sum, slot) => sum + slot.price, 0) / slots.length;
  const optimalSlots = slots.filter(slot => slot.isOptimal);
  const avgOptimalPrice = optimalSlots.reduce((sum, slot) => sum + slot.price, 0) / optimalSlots.length;
  const potentialSavings = (avgPrice - avgOptimalPrice) * slots.length * 1000; // Assuming 1000 units per slot
  return Math.round(potentialSavings * 100) / 100;
};

export default function ResolvePage() {
  const searchParams = useSearchParams();
  const dateString = searchParams.get('date');
  const loadString = searchParams.get('load');
  const timeString = searchParams.get('time');
  
  const [slots, setSlots] = useState([]);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (dateString && loadString) {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      const load = parseFloat(loadString);
      const optimalSlots = generateOptimalSlots(date, load);
      setSlots(optimalSlots);
      setSavings(calculateSavings(optimalSlots));
    }
  }, [dateString, loadString]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white text-center">
          Optimal Electricity Buying Slots
        </h1>
        
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-blue-500"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Date</h3>
              <p className="text-2xl text-blue-400">
                {dateString ? format(parse(dateString, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy') : '-'}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-red-500"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Peak Time</h3>
              <p className="text-2xl text-red-400">{timeString || '-'}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-red-500"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Peak Load</h3>
              <p className="text-2xl text-red-400">{loadString} MW</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-green-500"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Potential Savings</h3>
              <p className="text-2xl text-green-400">₹{savings.toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Price and Demand Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-blue-500"
          >
            <h3 className="text-xl font-bold text-white mb-4">Price and Demand Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="hour" stroke="#fff" />
                  <YAxis yAxisId="left" stroke="#fff" />
                  <YAxis yAxisId="right" orientation="right" stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    name="Price (₹/unit)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#82ca9d" 
                    name="Demand (MW)"
                  />
                  {slots.map((slot, index) => (
                    slot.isOptimal && (
                      <ReferenceArea
                        key={index}
                        x1={slot.hour}
                        x2={slot.hour}
                        yAxisId="left"
                        fill="#4CAF50"
                        fillOpacity={0.1}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Optimal Slots List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border-2 border-green-500"
          >
            <h3 className="text-xl font-bold text-white mb-4">Optimal Buying Slots</h3>
            <div className="grid gap-2">
              {slots.filter(slot => slot.isOptimal).map((slot, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-green-500/10 p-3 rounded-lg"
                >
                  <div>
                    <span className="text-white font-medium">{slot.hour}</span>
                    <span className="ml-4 text-green-400">₹{slot.price}/unit</span>
                  </div>
                  <div className="text-green-400">
                    {slot.demand} MW
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 