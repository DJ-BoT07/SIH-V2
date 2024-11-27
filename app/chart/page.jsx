'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import dynamic from 'next/dynamic';
import { FullPageLoader, Loader } from "../component/Loader";
import { generateHourlyData, calculateDailyStats } from '@/lib/utils';

const CurrentLoadChart = dynamic(() => import('./CurrentLoadChart'), { 
  loading: () => <Loader />,
  ssr: false 
});
const ShortTermForecastChart = dynamic(() => import('./ShortTermForecastChart'), { 
  loading: () => <Loader />,
  ssr: false 
});
const LongTermForecastChart = dynamic(() => import('./LongTermForecastChart'), { 
  loading: () => <Loader />,
  ssr: false 
});
const AdditionalInsightsChart = dynamic(() => import('./AdditionalInsightsChart'), { 
  loading: () => <Loader />,
  ssr: false 
});

function ChartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const area = searchParams.get('area');
  const dateString = searchParams.get('date');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    if (!dateString) return new Date();
    try {
      return parse(dateString, 'yyyy-MM-dd', new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  });

  const [hourlyData, setHourlyData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const data = generateHourlyData(selectedDate);
    setHourlyData(data);
    setStats(calculateDailyStats(data));
  }, [selectedDate]);

  const formattedDate = format(selectedDate, 'MMMM d, yyyy');

  // Update selectedDate when URL date changes
  useEffect(() => {
    if (dateString) {
      try {
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    // Add a small delay before hiding the loader to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [dateString]);

  if (!stats) return <Loader />;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen p-4 sm:p-6 md:p-8">
      {isLoading && <FullPageLoader />}
      <div className="rounded-lg shadow-lg mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white text-center">
          Electricity Load Forecast
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
          <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
            <p className="text-base sm:text-lg font-semibold mb-2">Area</p>
            <p className="text-lg sm:text-xl">{area}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
            <p className="text-base sm:text-lg font-semibold mb-2">Selected Date</p>
            <p className="text-lg sm:text-xl">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1 lg:col-span-2 border-4 border-blue-500 rounded-lg p-4 sm:p-6 md:p-10 shadow-lg">
          <CurrentLoadChart date={selectedDate} data={hourlyData} />
        </div>
        <div className="border-4 border-blue-500 rounded-lg p-4 sm:p-6 shadow-lg">
          <ShortTermForecastChart date={selectedDate} data={hourlyData} />
        </div>
        <div className="border-4 border-blue-500 rounded-lg p-4 sm:p-6 shadow-lg">
          <LongTermForecastChart date={selectedDate} data={hourlyData} />
        </div>
        <div className="col-span-1 lg:col-span-2 border-4 border-blue-500 rounded-lg p-4 sm:p-6 shadow-lg">
          <AdditionalInsightsChart date={selectedDate} data={hourlyData} stats={stats} />
        </div>
      </div>
    </div>
  );
}

export default function Chart() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ChartContent />
    </Suspense>
  );
}