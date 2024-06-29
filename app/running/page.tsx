"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Link from 'next/link';
import Loading from '@/components/Loading/Loading';
import Badge from '@/components/Badge/Badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type RunningActivity = {
  start_date: string;
  distance: number;
  total_elevation_gain: number; // Add elevation gain to the type
};

type AggregatedData = {
  year: string;
  total_distance: string; // In kilometers, formatted as a string
  total_runs: number;
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Running clears my mind',
    },
  },
};

const chartOptions = {
  scales: {
    yAxes: [
      {
        id: 'y-axis-distance',
        type: 'linear',
        position: 'left',
        ticks: {
          beginAtZero: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Distance (km)'
        }
      },
      {
        id: 'y-axis-runs',
        type: 'linear',
        position: 'right',
        ticks: {
          beginAtZero: true
        },
        gridLines: {
          drawOnChartArea: false // Only want the grid lines for one axis to show up
        },
        scaleLabel: {
          display: true,
          labelString: 'Runs'
        }
      }
    ]
  }
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RunningStats = () => {
  const [runningGraphData, setRunningGraphData] = useState<AggregatedData[]>([]);
  const [runningTableData, setRunningTableData] = useState<AggregatedData[]>([]);
  const [optimalPath, setOptimalPath] = useState<number[]>([]);
  const [actualMonthlyProgress, setActualMonthlyProgress] = useState<number[]>([]);
  const [cumulativeMonthlyProgress, setCumulativeMonthlyProgress] = useState<number[]>([]);
  const [progressDelta, setProgressDelta] = useState<number[]>([]);
  const [monthlyElevationGain, setMonthlyElevationGain] = useState<number[]>([]); // New state for elevation gain

  const [loading, setLoading] = useState<boolean>(true);

  const lastYearTotal = runningGraphData.find(data => data.year === (new Date().getFullYear() - 1).toString())?.total_distance || '0';
  const yearlyGoal = parseFloat(lastYearTotal) * 1.1; // Increase by 10%

  useEffect(() => {
    const fetchRunningData = async () => {
      setLoading(true);
      const startTime = Date.now();
      const minLoadingTime = 1000;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const { data, error } = await supabase
        .from('activities')
        .select('start_date, distance, total_elevation_gain')
        .eq('type', 'Run');

      if (error) {
        console.error('Error fetching running data:', error);
        setLoading(false);
        return;
      }

      let aggregatedData = aggregateDataByYear(data || []);

      const dataForTable = aggregatedData.sort((a, b) => parseInt(b.year) - parseInt(a.year));
      setRunningTableData(dataForTable);

      const dataForGraph = [...aggregatedData].sort((a, b) => parseInt(a.year) - parseInt(b.year));
      setRunningGraphData(dataForGraph);

      // Calculate last year's total from the graph data
      const lastYear = new Date().getFullYear() - 1;
      const lastYearData = dataForGraph.find(d => parseInt(d.year) === lastYear);
      const lastYearTotal = lastYearData ? parseFloat(lastYearData.total_distance) : 0;
      const yearlyGoal = lastYearTotal * 1.1; // Increase by 10%

      // Calculate actual monthly progress for the current year
      const actualMonthlyProgress = new Array(12).fill(0); // Initialize an array for each month
      const monthlyElevationGain = new Array(12).fill(0); // Initialize an array for each month
      data?.forEach(activity => {
        const activityDate = new Date(activity.start_date);
        if (activityDate.getFullYear() === currentYear) {
          const month = activityDate.getMonth(); // Get the month index (0-11)
          actualMonthlyProgress[month] += activity.distance / 1000; // Convert distance to kilometers and add to the respective month
          monthlyElevationGain[month] += activity.total_elevation_gain; // Add elevation gain to the respective month
        }
      });

      // Round the monthly distances and elevation gains to two decimal places
      for (let i = 0; i < actualMonthlyProgress.length; i++) {
        actualMonthlyProgress[i] = parseFloat(actualMonthlyProgress[i].toFixed(2));
        monthlyElevationGain[i] = parseFloat(monthlyElevationGain[i].toFixed(2));
      }

      // After calculating the monthly distances
      let cumulativeTotal = 0;
      const cumulativeMonthlyProgress: number[] = [];

      for (let i = 0; i <= currentMonth; i++) { // Iterate only up to the current month
        cumulativeTotal += actualMonthlyProgress[i];
        cumulativeMonthlyProgress.push(parseFloat(cumulativeTotal.toFixed(2))); // Add to the array
      }

      const optimalPath = Array.from({ length: 12 }, (_, index) => (index + 1) * (yearlyGoal / 12)).map(distance => parseFloat(distance.toFixed(2)));

      setOptimalPath(optimalPath);
      setActualMonthlyProgress(actualMonthlyProgress);
      setCumulativeMonthlyProgress(cumulativeMonthlyProgress);
      setMonthlyElevationGain(monthlyElevationGain);

      // Calculate the difference between actual progress and the optimal path
      const progressDelta = cumulativeMonthlyProgress.map((cumulative, index) => {
        // Ensure index is within the bounds of the optimalPath array
        if (index < optimalPath.length) {
          return parseFloat((cumulative - optimalPath[index]).toFixed(2));
        }
        return cumulative; // If beyond optimalPath, return the cumulative value as is
      });

      setProgressDelta(progressDelta);

      const fetchTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - fetchTime;
      if (remainingTime > 0) {
        setTimeout(() => setLoading(false), remainingTime);
      } else {
        setLoading(false);
      }
    };

    fetchRunningData();
  }, []);

  const aggregateDataByYear = (activities: RunningActivity[]): AggregatedData[] => {
    const aggregatedData = activities.reduce((acc, activity) => {
      const year = new Date(activity.start_date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = { total_distance: 0, total_runs: 0 };
      }
      acc[year].total_distance += activity.distance;
      acc[year].total_runs += 1;
      return acc;
    }, {} as Record<string, { total_distance: number; total_runs: number }>);

    return Object.entries(aggregatedData).map(([year, data]) => ({
      year,
      total_distance: (data.total_distance / 1000).toFixed(2), // Convert to kilometers
      total_runs: data.total_runs,
    }));
  };

  const chartData = {
    labels: runningGraphData.map((data) => data.year),
    datasets: [
      {
        label: 'Distance',
        data: runningGraphData.map((data) => parseFloat(data.total_distance)),
        borderColor: 'rgb(196, 87, 255)',
        backgroundColor: 'rgba(196, 87, 255, 0.5)',
      },
      {
        label: 'Runs',
        data: runningGraphData.map((data) => parseFloat(data.total_runs.toString())),
        borderColor: 'rgb(129, 87, 255)',
        backgroundColor: 'rgba(129, 87, 255, 0.5)',
        yAxisID: 'y-axis-runs'
      }
    ],
  };

  const progressChartData: ChartData<"line", number[], string> = {
    labels: months,
    datasets: [
      {
        type: 'line',
        label: 'Optimal Path',
        borderColor: 'rgb(50, 50, 50)',
        borderWidth: 2,
        fill: false,
        data: optimalPath,
        tension: 0.1
      },
      {
        type: 'line', // Set this to 'line' for cumulative line chart
        label: 'Actual Progress',
        data: cumulativeMonthlyProgress,
        borderColor: 'rgb(196, 87, 255)',
        backgroundColor: 'rgba(196, 87, 255, 0.5)',
        borderWidth: 2,
        fill: false,
        tension: 0.4 // Smooth the line
      }
    ],
  };

  const progressChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Distance (km)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Goal Progress (last year +10%)'
      }
    }
  };

  const elevationChartData: ChartData<"line", number[], string> = {
    labels: months,
    datasets: [
      {
        label: 'Total Elevation Gain',
        data: monthlyElevationGain,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(129, 87, 255)',
        borderWidth: 2
      }
    ]
  };

  const elevationChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Elevation Gain (m) / Distance (km)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Moar Trails Please'
      }
    }
  };

  if (loading) {
    return <div><Loading /></div>;
  }

  return (
    <main className="page">
      <h1 className="page-title">Numbers behind my running adventures.</h1>
      <Line options={options} data={chartData} />
      <div className="grid-container">
        <div className="grid-header">Year</div>
        <div className="grid-header">Total Distance (km)</div>
        <div className="grid-header">Total Runs</div>
        {runningTableData.map((item) => (
          <React.Fragment key={item.year}>
            <div className="grid-item">{item.year}</div>
            <div className="grid-item">{item.total_distance}</div>
            <div className="grid-item">{item.total_runs}</div>
          </React.Fragment>
        ))}
      </div>

      <Line options={progressChartOptions} data={progressChartData} />

      <div className="grid-container">
        <div className="grid-header">Month</div>
        <div className="grid-header">Total Distance (km)</div>
        <div className="grid-header">Behind Target (km)</div>
        {progressDelta.map((distance, index) => (
          <React.Fragment key={index}>
            <div className="grid-item">{months[index]}</div>
            <div className="grid-item">{actualMonthlyProgress[index]}</div>
            <div className="grid-item">{distance}</div>
          </React.Fragment>
        ))}
      </div>


      <Line options={elevationChartOptions} data={elevationChartData} />

      <div className="grid-container">
        <div className="grid-header">Month</div>
        <div className="grid-header">Total Elevation Gain (m)</div>
        <div className="grid-header">Total Distance (km)</div>
        {monthlyElevationGain.map((gain, index) => (
          <React.Fragment key={index}>
            <div className="grid-item">{months[index]}</div>
            <div className="grid-item">{gain}</div>
            <div className="grid-item">{actualMonthlyProgress[index]}</div>
          </React.Fragment>
        ))}
      </div>

      <div className="badges-wrapper">
        <Badge
          image="/badges/badge-ecotrail-2023.png"
          title="Eco Cluj Ultra 2023"
          distance="50km"
          time="06:56:17"
          elevation="1,580m"
        />
        <Badge
          image="/badges/badge-wizz-2023.png"
          title="WIZZ Cluj Marathon 2023"
          distance="42.2km"
          time="04:02:25"
          elevation="98m"
        />
        <Badge
          image="/badges/badge-wizz-2022.png"
          title="WIZZ Cluj Marathon 2022"
          distance="42.2km"
          time="04:05:57"
          elevation="98m"
        />
      </div>
    </main>
  );
};

export default RunningStats;
