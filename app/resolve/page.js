'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
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
import { PEAK_THRESHOLD, generateHourlyData, calculateDailyStats } from '@/lib/utils';
import { DataInsights } from '@/app/component/DataInsights';

function ResolveContent() {
  const searchParams = useSearchParams();
  const dateString = searchParams.get('date');
  const targetDate = dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : new Date();
  const today = new Date();

  // Generate data using shared utility
  const generateData = useCallback(() => {
    return generateHourlyData(targetDate, today);
  }, [targetDate]);

  const [priceData, setPriceData] = useState([]);
  const [stats, setStats] = useState({
    avgTermAhead: 0,
    avgRealTime: 0,
    totalSavings: 0,
    peakLoad: 0
  });

  useEffect(() => {
    const data = generateData();
    setPriceData(data);
    setStats(calculateDailyStats(data));
  }, [generateData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Market Price Analysis
          </h1>
          <div className="text-base sm:text-lg text-white">
            Comparing today&apos;s Term Ahead Price with expected Real Time Price for {format(targetDate, 'MMMM d, yyyy')}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-500/30">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Today&apos;s Term Ahead Price</h3>
            <p className="text-xl sm:text-2xl text-green-400">₹{stats.avgTermAhead}/MW</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{format(today, 'MMM d, yyyy')}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-red-500/30">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Future Real Time Price</h3>
            <p className="text-xl sm:text-2xl text-red-400">₹{stats.avgRealTime}/MW</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{format(targetDate, 'MMM d, yyyy')}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-yellow-500/30">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Peak Load</h3>
            <p className="text-xl sm:text-2xl text-yellow-400">{stats.peakLoad.toLocaleString()} MW</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Maximum demand</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-green-500/30">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Total Potential Savings</h3>
            <p className="text-xl sm:text-2xl text-green-400">₹{stats.totalSavings.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">By buying term ahead</p>
          </div>
        </div>

        {/* Price Comparison Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-500/30">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Price Comparison</h2>
            <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis 
                    dataKey="timeSlot" 
                    stroke="#fff"
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Time Slot', 
                      position: 'insideBottom', 
                      offset: -10,
                      fill: '#fff',
                      fontSize: 12
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#fff"
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Price (₹/MW)', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#fff',
                      fontSize: 12
                    }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#fff"
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Load (MW)', 
                      angle: 90, 
                      position: 'insideRight',
                      fill: '#fff',
                      fontSize: 12
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'load') return [`${value.toLocaleString()} MW`, 'Load'];
                      return [`₹${value}`, name.includes('Term') ? 'Term Ahead' : 'Real Time'];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <ReferenceLine 
                    yAxisId="right" 
                    y={PEAK_THRESHOLD} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'Peak Threshold', 
                      position: 'right', 
                      fill: '#ef4444',
                      fontSize: 12
                    }} 
                  />
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

          <div className="lg:col-span-1">
            <DataInsights 
              data={priceData} 
              type="pricing" 
              className="h-full border border-blue-500/30"
            />
          </div>
        </div>

        {/* Price Details Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-500/30">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Market Price Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-blue-500/30">
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Time Slot</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Load (MW)</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Term Ahead Price (₹/MW)<br/><span className="text-xs sm:text-sm text-gray-400">{format(today, 'MMM d')}</span></th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Real Time Price (₹/MW)<br/><span className="text-xs sm:text-sm text-gray-400">{format(targetDate, 'MMM d')}</span></th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Potential Saving</th>
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
                      <td className="py-2 sm:py-3 px-2 sm:px-4">{slot.timeSlot}</td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 ${slot.load > PEAK_THRESHOLD ? 'text-red-400 font-semibold' : ''}`}>
                        {slot.load.toLocaleString()}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-green-400">{slot.termAheadPrice}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-red-400">{slot.realTimePrice}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-yellow-400">
                        ₹{((slot.saving * slot.load) / 1000).toFixed(2)}K
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <DataInsights 
              data={{ 
                hourlyData: priceData,
                summary: stats
              }} 
              type="general" 
              className="h-full border border-blue-500/30"
            />
          </div>
        </div>

        {/* Total Savings Summary */}
        <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Total Potential Savings Analysis</h3>
          <p className="text-lg sm:text-xl text-green-400">
            ₹{stats.totalSavings.toLocaleString()} could be saved by purchasing at today&apos;s term ahead prices
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Based on load-weighted price differences between term ahead and real time markets
          </p>
        </div>
      </div>
    </div>
  );
}

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

export default function ResolvePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResolveContent />
    </Suspense>
  );
} 