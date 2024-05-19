import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

const clientID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '';
const clientSecret = process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET || '';
const refreshToken = process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN || '';
const refreshTokenUrl = 'https://www.strava.com/oauth/token';
const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';

interface Activity {
  id: number;
  name: string;
  start_date: Date;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  suffer_score: number;
  location_country: string;
  timezone: string;
  // Optional fields
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  device_watts?: boolean;
}

async function refreshAccessToken() {
  const params = new URLSearchParams({
    client_id: clientID,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(refreshTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    console.error('Failed to refresh access token:', response.statusText);
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  console.log('New Access Token:', data.access_token); // Log for debugging, remove in production
  return data.access_token;
}


const fetchActivities = async (accessToken: string) => {
  console.log(`Using Access Token: ${accessToken}`); // Log the token being used for the request

  console.log("clientID", clientID);

  const response = await fetch(`${activitiesUrl}?access_token=${accessToken}&per_page=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Ensure the Authorization header is correctly formatted
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch activities with status: ${response.status}, ${response.statusText}`);
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }

  const activities: Activity[] = await response.json();
  return activities;
};

const mapStravaToSupabaseActivity = (stravaActivity: any): Activity => {
  return {
    id: stravaActivity.id,
    name: stravaActivity.name,
    start_date: new Date(stravaActivity.start_date),
    type: stravaActivity.type,
    distance: stravaActivity.distance,
    moving_time: stravaActivity.moving_time,
    elapsed_time: stravaActivity.elapsed_time,
    total_elevation_gain: stravaActivity.total_elevation_gain,
    average_speed: stravaActivity.average_speed,
    max_speed: stravaActivity.max_speed,
    average_heartrate: stravaActivity.average_heartrate,
    max_heartrate: stravaActivity.max_heartrate,
    suffer_score: stravaActivity.suffer_score,
    location_country: stravaActivity.location_country,
    timezone: stravaActivity.timezone,
    // Optional fields
    average_cadence: stravaActivity.average_cadence,
    average_temp: stravaActivity.average_temp,
    average_watts: stravaActivity.average_watts,
    max_watts: stravaActivity.max_watts,
    weighted_average_watts: stravaActivity.weighted_average_watts,
    device_watts: stravaActivity.device_watts,
  };
};

const syncActivitiesToSupabase = async (activities: Activity[]) => {
  const errors: string[] = [];

  for (const activity of activities) {
    const { error } = await supabase.from('activities').upsert([activity]);

    if (error) {
      console.error(`Error inserting activity ${activity.id}:`, error.message);
      errors.push(`Activity ${activity.id}: ${error.message}`);
    }
  }

  return errors;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accessToken = await refreshAccessToken();
    const stravaActivities = await fetchActivities(accessToken);
    const mappedActivities = stravaActivities.map(mapStravaToSupabaseActivity);
    const syncErrors = await syncActivitiesToSupabase(mappedActivities);

    console.log("stravaActivities", stravaActivities);

    if (syncErrors.length > 0) {
      return res.status(500).json({ message: 'Some activities failed to sync', details: syncErrors });
    }

    res.status(200).json({ message: 'Activities fetched and synced successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}
