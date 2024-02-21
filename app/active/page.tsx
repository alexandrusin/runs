"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Adjust this import path to where your Supabase client is initialized
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Activity {
  start_date: string;
  type: string;
}

interface AggregatedData {
  year: string;
  total_runs: number;
  total_rideVirtualRide: number;
  total_weightTrainingWorkout: number;
}

type ActivityCount = {
  total_runs: number;
  total_rideVirtualRide: number;
  total_weightTrainingWorkout: number;
};

const ActivityGraph = () => {
  const [graphData, setGraphData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('start_date, type')
        .in('type', ['Run', 'Ride', 'VirtualRide', 'WeightTraining', 'Workout']);

      if (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
        return;
      }

      const aggregatedData = aggregateDataByYear(data);
      setGraphData(aggregatedData);
      setLoading(false);
    };

    fetchActivities();
  }, []);

  const aggregateDataByYear = (activities: Activity[]): AggregatedData[] => {
    const aggregatedData: Record<string, ActivityCount> = {};
  
    activities.forEach(({ start_date, type }: Activity) => {
      const year = new Date(start_date).getFullYear().toString();
      const typeGroup = getActivityGroup(type);
  
      if (!aggregatedData[year]) {
        aggregatedData[year] = { total_runs: 0, total_rideVirtualRide: 0, total_weightTrainingWorkout: 0 };
      }
  
      // Using typeGroup as a key is safe because getActivityGroup returns a keyof ActivityCount
      aggregatedData[year][typeGroup]++;
    });
  
    return Object.entries(aggregatedData).map(([year, data]) => ({
      year,
      total_runs: data.total_runs,
      total_rideVirtualRide: data.total_rideVirtualRide,
      total_weightTrainingWorkout: data.total_weightTrainingWorkout,
    }));
  };
  
  const getActivityGroup = (type: string): keyof ActivityCount => {
    switch (type) {
      case 'Run':
        return 'total_runs';
      case 'Ride':
      case 'VirtualRide':
        return 'total_rideVirtualRide';
      case 'WeightTraining':
      case 'Workout':
        return 'total_weightTrainingWorkout';
      default:
        // Handle the default case appropriately
        return 'total_runs';
    }
  };

  const chartData = {
    labels: graphData.map((data) => data.year),
    datasets: [
      {
        label: 'Runs',
        data: graphData.map((data) => data.total_runs),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Rides',
        data: graphData.map((data) => data.total_rideVirtualRide),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Strength',
        data: graphData.map((data) => data.total_weightTrainingWorkout),
        borderColor: 'rgb(129, 87, 255)',
        backgroundColor: 'rgba(129, 87, 255, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Battle of the Giants',
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="running-stats">
      <Line options={options} data={chartData} />
    </main>
  );
};

export default ActivityGraph;
