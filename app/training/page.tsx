"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

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
import Link from 'next/link';
import Loading from '@/components/Loading/Loading';

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
  moving_time: number;
}

interface MonthlyData {
  month: string;
  hours: number;
}

interface AggregatedData {
  year: string;
  total_runs: number;
  total_rideVirtualRide: number;
  total_weightTrainingWorkout: number;

  total_hours: number;  
  hours_runs: number;
  hours_rideVirtualRide: number;
  hours_weightTrainingWorkout: number;

  monthlyData: Record<string, MonthlyData>;
  peakMonth: string;
  peakHours: number;
  lowMonth: string;
  lowHours: number;
}

type ActivityCount = {
  total_runs: number;
  total_rideVirtualRide: number;
  total_weightTrainingWorkout: number;
};

const TrainingStats = () => {
  const [graphData, setGraphData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {

      setLoading(true);
      const startTime = Date.now();
      const minLoadingTime = 1000;

      const { data, error } = await supabase
        .from('activities')
        .select('start_date, type, moving_time')
        .in('type', ['Run', 'Ride', 'VirtualRide', 'WeightTraining', 'Workout']);

      if (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
        return;
      }

      const aggregatedData = aggregateDataByYear(data);
      setGraphData(aggregatedData);
      
      const fetchTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - fetchTime;

      if (remainingTime > 0) {
        setTimeout(() => setLoading(false), remainingTime);
      } else {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const initializeMonthlyData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyData: Record<string, MonthlyData> = {};
    months.forEach(month => {
      monthlyData[month] = { month, hours: 0 };
    });
    return monthlyData;
  };

  const aggregateDataByYear = (activities: Activity[]): AggregatedData[] => {
    const aggregatedData: Record<string, AggregatedData> = {};
  
    activities.forEach(({ start_date, type, moving_time }: Activity) => {
      const date = new Date(start_date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });
      const hours = moving_time / 3600; // Convert seconds to hours
  
      if (!aggregatedData[year]) {
        aggregatedData[year] = {
          year,
          total_runs: 0,
          total_rideVirtualRide: 0,
          total_weightTrainingWorkout: 0,
          total_hours: 0,
          hours_runs: 0,
          hours_rideVirtualRide: 0,
          hours_weightTrainingWorkout: 0,
          monthlyData: initializeMonthlyData(),
          peakMonth: '',
          peakHours: 0,
          lowMonth: '',
          lowHours: Infinity,
        };
      }

      aggregatedData[year].total_hours += hours;
      aggregatedData[year].monthlyData[month].hours += hours;
  
      // Update peak month and hours
      if (aggregatedData[year].monthlyData[month].hours > aggregatedData[year].peakHours) {
        aggregatedData[year].peakMonth = month;
        aggregatedData[year].peakHours = aggregatedData[year].monthlyData[month].hours;
      }      
  
      switch (type) {
        case 'Run':
          aggregatedData[year].total_runs++;
          aggregatedData[year].hours_runs += hours;
          break;
        case 'Ride':
        case 'VirtualRide':
          aggregatedData[year].total_rideVirtualRide++;
          aggregatedData[year].hours_rideVirtualRide += hours;
          break;
        case 'WeightTraining':
        case 'Workout':
          aggregatedData[year].total_weightTrainingWorkout++;
          aggregatedData[year].hours_weightTrainingWorkout += hours;
          break;
        // Add more cases as needed for other activity types
      }
    });

    Object.keys(aggregatedData).forEach(year => {
      Object.values(aggregatedData[year].monthlyData).forEach(monthData => {
        if (monthData.hours < aggregatedData[year].lowHours) {
          aggregatedData[year].lowMonth = monthData.month;
          aggregatedData[year].lowHours = monthData.hours;
        }
      });
    });
  
    return Object.values(aggregatedData);
  };

  const chartData = {
    labels: graphData.map((data) => data.year),
    datasets: [
      {
        label: 'Runs',
        data: graphData.map((data) => data.total_runs),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Rides',
        data: graphData.map((data) => data.total_rideVirtualRide),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Strength',
        data: graphData.map((data) => data.total_weightTrainingWorkout),
        borderColor: 'rgb(129, 87, 255)',
        backgroundColor: 'rgba(129, 87, 255, 0.5)',
        borderWidth: 2,
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
        text: 'Workouts Finished',
      },
    },
  };


  const totalHoursChartData = {
    labels: graphData.map((data) => data.year),
    datasets: [
      {
        label: 'Run',
        data: graphData.map((data) => data.hours_runs),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Ride',
        data: graphData.map((data) => data.hours_rideVirtualRide),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Strength',
        data: graphData.map((data) => data.hours_weightTrainingWorkout),
        borderColor: 'rgb(129, 87, 255)',
        backgroundColor: 'rgba(129, 87, 255, 0.5)',
        borderWidth: 2,
      },
    ],
  };


  const totalHoursChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Hours Sweating',
      },
    },
  };

  if (loading) {
    return <div>
      <Loading />
    </div>;
  }

  return (
    <main className="page">
      <h1 className="page-title">Battle of the giants for time and energy.</h1>
      <Line options={options} data={chartData} />
      <div className="grid-container col-4">
        <div className="grid-header">Year</div>
        <div className="grid-header">Year Total Hours</div>
        <div className="grid-header">Peak Month</div>
        <div className="grid-header">Peak Month Hours</div>
        {/* <div className="grid-header">Low Month</div>
        <div className="grid-header">Low Hours</div> */}
        {graphData.map((data) => (
          <React.Fragment key={data.year}>
            <div className="grid-item">{data.year}</div>
            <div className="grid-item">{data.total_hours.toFixed(2)}</div>
            <div className="grid-item">{data.peakMonth}</div>
            <div className="grid-item">{data.peakHours.toFixed(2)}</div>
            {/* <div className="grid-item">{data.lowMonth}</div>
            <div className="grid-item">{data.lowHours.toFixed(2)}</div>  */}
          </React.Fragment>
        ))}
      </div>
      <Line options={totalHoursChartOptions} data={totalHoursChartData} />
    </main>
  );
};

export default TrainingStats;
