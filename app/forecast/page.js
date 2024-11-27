"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { Calendar } from "../component/calendar/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullPageLoader } from "../component/Loader";

function ForecastContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateString = searchParams.get('date');
  const areaString = searchParams.get('area');

  const [selectedDate, setSelectedDate] = useState(() => {
    if (!dateString) return new Date();
    try {
      return parse(dateString, 'yyyy-MM-dd', new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  });

  const [selectedArea, setSelectedArea] = useState(areaString || 'BSES Yamuna Power Limited');
  const [isLoading, setIsLoading] = useState(false);

  const areas = [
    "BSES Yamuna Power Limited",
    "BSES Rajdhani Power Limited",
    "Tata Power Delhi Distribution Limited"
  ];

  const handleDateSelect = (date) => {
    setIsLoading(true);
    setSelectedDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    router.push(`/chart?area=${encodeURIComponent(selectedArea)}&date=${formattedDate}`);
  };

  const handleAreaChange = (value) => {
    setIsLoading(true);
    setSelectedArea(value);
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/chart?area=${encodeURIComponent(value)}&date=${formattedDate}`);
    }
  };

  // Clean up loading state if navigation takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [selectedDate, selectedArea]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      {isLoading && <FullPageLoader />}
      <div className="h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold py-4 text-white text-center">
          Select Date and Area for Load Forecast
        </h1>
        
        <div className="max-w-xs mx-auto mb-4">
          <Select value={selectedArea} onValueChange={handleAreaChange}>
            <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[calc(100vh-10rem)]">
          <Calendar onDateSelect={handleDateSelect} />
        </div>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ForecastContent />
    </Suspense>
  );
}