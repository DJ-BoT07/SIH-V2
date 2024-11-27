'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse, differenceInDays } from 'date-fns';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

function ResolveContent() {
  const searchParams = useSearchParams();
  const dateString = searchParams.get('date');
  const targetDate = dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : new Date();
  const today = new Date();
  const daysToTarget = differenceInDays(targetDate, today);
  const PEAK_THRESHOLD = 15000; // MW

  // Generate price data for 24 hours using deterministic values
  const generatePriceData = useCallback(() => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      // Base load calculation with peak hours - using deterministic pattern
      const isHighDemand = (hour >= 9 && hour <= 12) || (hour >= 18 && hour <= 21);
      const timeBasedLoad = 13000 + Math.sin(hour * Math.PI / 12) * 3000;
      const baseLoad = isHighDemand ? 
        timeBasedLoad + 2000 : // Peak hours
        timeBasedLoad;         // Normal hours
      
      // Base price calculation based on load - deterministic
      const basePrice = 3 + (baseLoad > PEAK_THRESHOLD ? 2 : 0) + Math.sin(hour * Math.PI / 12);
      
      // Today's term ahead price - deterministic
      const termAheadPrice = Number((basePrice * 0.95).toFixed(2));
      
      // Future real time price - deterministic increase based on days
      const futureFactor = 1 + (daysToTarget * 0.1); // 10% increase per day
      const realTimePrice = Number((termAheadPrice * futureFactor).toFixed(2));
      
      data.push({
        timeSlot: `${hour.toString().padStart(2, '0')}:00`,
        load: Math.round(baseLoad),
        termAheadPrice,
        realTimePrice,
        saving: Number((realTimePrice - termAheadPrice).toFixed(2))
      });
    }
    return data;
  }, [daysToTarget]); // Include daysToTarget in dependencies

  // Use useEffect to set state after initial render
  const [priceData, setPriceData] = useState([]);
  useEffect(() => {
    setPriceData(generatePriceData());
  }, [generatePriceData]); // Include generatePriceData in dependencies

  // Calculate total potential savings
  const totalSavings = priceData.reduce((total, slot) => {
    return total + (slot.saving * (slot.load / 1000)); // Savings per MWh * GWh
  }, 0);

  // Calculate averages
  const averages = {
    termAhead: Number((priceData.reduce((sum, item) => sum + item.termAheadPrice, 0) / 24).toFixed(2)),
    realTime: Number((priceData.reduce((sum, item) => sum + item.realTimePrice, 0) / 24).toFixed(2))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Market Price Analysis
        </h1>
        <div className="text-center text-lg text-white mb-8">
          Comparing today&apos;s Term Ahead Price with expected Real Time Price for {format(targetDate, 'MMMM d, yyyy')}
          <div className="text-sm text-gray-400 mt-1">
            {daysToTarget} days difference
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Today&apos;s Term Ahead Price</h3>
            <p className="text-2xl text-green-400">₹{averages.termAhead}/MW</p>
            <p className="text-sm text-gray-400 mt-1">{format(today, 'MMM d, yyyy')}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Future Real Time Price</h3>
            <p className="text-2xl text-red-400">₹{averages.realTime}/MW</p>
            <p className="text-sm text-gray-400 mt-1">{format(targetDate, 'MMM d, yyyy')}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Expected Price Increase</h3>
            <p className="text-2xl text-yellow-400">
              {((averages.realTime / averages.termAhead - 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400 mt-1">Over {daysToTarget} days</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Total Potential Savings</h3>
            <p className="text-2xl text-green-400">₹{Math.round(totalSavings).toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">By buying term ahead</p>
          </div>
        </div>

        {/* Price Comparison Graph */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">Price Comparison</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis 
                  dataKey="timeSlot" 
                  stroke="#fff"
                  label={{ 
                    value: 'Time Slot', 
                    position: 'insideBottom', 
                    offset: -10,
                    fill: '#fff'
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#fff"
                  label={{ 
                    value: 'Price (₹/MW)', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: '#fff'
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#fff"
                  label={{ 
                    value: 'Load (MW)', 
                    angle: 90, 
                    position: 'insideRight',
                    fill: '#fff'
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'load') return [`${value.toLocaleString()} MW`, 'Load'];
                    return [`₹${value}`, name.includes('Term') ? 'Term Ahead' : 'Real Time'];
                  }}
                />
                <Legend />
                <ReferenceLine yAxisId="right" y={PEAK_THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Peak Threshold', position: 'right', fill: '#ef4444' }} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="load"
                  fill="#3b82f6"
                  stroke="#3b82f6"
                  fillOpacity={0.3}
                  name="Load"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="termAheadPrice" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  name={`Term Ahead Price (${format(today, 'MMM d')})`}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="realTimePrice" 
                  stroke="#f87171" 
                  strokeWidth={2}
                  name={`Real Time Price (${format(targetDate, 'MMM d')})`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Details Table */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">Market Price Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-blue-500/30">
                  <th className="py-3 px-4 text-left">Time Slot</th>
                  <th className="py-3 px-4 text-left">Load (MW)</th>
                  <th className="py-3 px-4 text-left">Term Ahead Price (₹/MW)<br/><span className="text-sm text-gray-400">{format(today, 'MMM d')}</span></th>
                  <th className="py-3 px-4 text-left">Real Time Price (₹/MW)<br/><span className="text-sm text-gray-400">{format(targetDate, 'MMM d')}</span></th>
                  <th className="py-3 px-4 text-left">Potential Saving</th>
                </tr>
              </thead>
              <tbody>
                {priceData.map((slot) => (
                  <tr 
                    key={slot.timeSlot}
                    className={`
                      border-b border-blue-500/10 hover:bg-blue-500/10
                      ${slot.load > PEAK_THRESHOLD ? 'bg-red-900/20' : ''}
                    `}
                  >
                    <td className="py-3 px-4">{slot.timeSlot}</td>
                    <td className={`py-3 px-4 ${slot.load > PEAK_THRESHOLD ? 'text-red-400 font-semibold' : ''}`}>
                      {slot.load.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-green-400">{slot.termAheadPrice}</td>
                    <td className="py-3 px-4 text-red-400">{slot.realTimePrice}</td>
                    <td className="py-3 px-4 text-yellow-400">
                      ₹{((slot.saving * slot.load) / 1000).toFixed(2)}K
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Savings Summary */}
          <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Total Potential Savings Analysis</h3>
            <p className="text-green-400 text-xl">
              ₹{Math.round(totalSavings).toLocaleString()} could be saved by purchasing at today&apos;s term ahead prices
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Based on load-weighted price differences between term ahead and real time markets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading market analysis...</p>
      </div>
    </div>
  );
}

// Main export
export default function ResolvePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResolveContent />
    </Suspense>
  );
} 