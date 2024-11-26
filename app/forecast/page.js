"use client";
import { useState } from "react";
import { Calendar } from "../component/calendar/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const subAreas = {
  "BSES Rajdhani Power Limited": [
    "Vasant Kunj", "Saket", "Vasant Vihar", "Dwarka",
    "Janakpuri", "Punjabi Bagh", "Hauz Khas", "Rajouri Garden"
  ],
  "BSES Yamuna Power Limited": [
    "Mayur Vihar", "Laxmi Nagar", "Gandhi Nagar", "Preet Vihar",
    "Shahdara", "Chandni Chowk", "Yamuna Vihar", "Krishna Nagar"
  ],
  "Tata Power Delhi Distribution Limited": [
    "Rohini", "Pitampura", "Shalimar Bagh", "Model Town",
    "Ashok Vihar", "Civil Lines", "Narela", "Jahangirpuri"
  ],
  "New Delhi Municipal Council": [
    "Connaught Place", "Chanakyapuri", "India Gate", "Lutyens' Delhi",
    "President's Estate", "Parliament House area"
  ],
};

export default function ForecastPage() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedSubArea, setSelectedSubArea] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAreaChange = (value) => {
    setSelectedArea(value);
    setSelectedSubArea(null);
  };

  const handleSubAreaChange = (value) => {
    setSelectedSubArea(value);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleGenerateForecast = () => {
    if (selectedArea && selectedSubArea && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/chart?area=${encodeURIComponent(selectedArea)}&subArea=${encodeURIComponent(selectedSubArea)}&date=${formattedDate}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Load Forecast Calendar</h1>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="text-white hover:text-black"
          >
            Back to Home
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-left text-white">Area</label>
            <Select onValueChange={handleAreaChange}>
              <SelectTrigger className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subAreas).map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-left text-white">Sub-Area</label>
            <Select 
              onValueChange={handleSubAreaChange} 
              disabled={!selectedArea}
            >
              <SelectTrigger className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SelectValue placeholder={selectedArea ? "Select a sub-area" : "Select an area first"} />
              </SelectTrigger>
              <SelectContent>
                {selectedArea && subAreas[selectedArea].map((subArea) => (
                  <SelectItem key={subArea} value={subArea}>{subArea}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg">
          <Calendar onDateSelect={handleDateSelect} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleGenerateForecast}
            disabled={!selectedArea || !selectedSubArea}
            className="px-6 py-2 text-lg"
          >
            Generate Forecast
          </Button>
        </div>
      </div>
    </div>
  );
} 