// pages/api/syncStrava.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';


const fetchStravaActivities = async () => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          'Authorization': `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching Strava activities: ${response.statusText}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      if (attempt === 3) throw error;
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Function to sync activities to Supabase
const syncActivitiesToSupabase = async (activities: any[]) => {
  for (const activity of activities) {
    const { data, error } = await supabase
      .from('activities')
      .upsert([{
        id: activity.id,
        athlete_id: activity.athlete.id,
        name: activity.name,
        // Add more fields as needed
      }]);

    if (error) throw new Error(`Error inserting into Supabase: ${error.message}`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const activities = await fetchStravaActivities();
    await syncActivitiesToSupabase(activities);
    res.status(200).json({ message: 'Successfully synced activities' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
