import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ParsedData } from '../../../types';
import { nivoTheme } from './theme';

interface ReviewsByCityStateChartProps {
  data: ParsedData['data'];
  groupBy: 'city' | 'state';
}

// Helper function to parse address
const parseAddress = (address: string): { city: string | null; state: string | null } => {
  if (!address || typeof address !== 'string') {
    return { city: null, state: null };
  }
  const parts = address.split(',').map(part => part.trim());
  if (parts.length < 3) {
    return { city: null, state: null }; // Not enough parts to determine city/state reliably
  }
  // Heuristic: Assumes format like "..., City, State ZIP, Country"
  // State is the second to last element before the country
  const state = parts[parts.length - 2].replace(/\s\d{5,}/, '').trim(); // Remove ZIP code from state
  const city = parts[parts.length - 3].trim();
  
  return { city, state };
};

export const ReviewsByCityStateChart: React.FC<ReviewsByCityStateChartProps> = ({ data, groupBy }) => {
  console.log('📊 [ReviewsByCityStateChart] Received raw data:', data);

  let actualFeatures: any[] = [];
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  
  console.log(`📊 [ReviewsByCityStateChart] Extracted ${actualFeatures.length} features for processing.`);

  const locationCounts = actualFeatures.reduce((acc: { [key: string]: number }, item: any) => {
    const address = item.properties?.location?.address;
    if (address) {
      const { city, state } = parseAddress(address);
      const key = groupBy === 'city' ? city : state;
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
    }
    return acc;
  }, {});

  const chartData = Object.entries(locationCounts)
    .map(([location, count]) => ({
      location,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Top 15

  console.log(`📊 [ReviewsByCityStateChart] Processed into ${chartData.length} locations. Top result:`, chartData[0] || 'N/A');

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No valid city/state data could be parsed from the addresses.
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={chartData}
        keys={['count']}
        indexBy="location"
        margin={{ top: 50, right: 130, bottom: 80, left: 60 }} // Increased bottom margin for labels
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45, // Rotate labels for better readability on long names
          legend: groupBy === 'city' ? 'City' : 'State',
          legendPosition: 'middle',
          legendOffset: 65, // Adjusted for rotated labels
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Number of Reviews',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        theme={nivoTheme}
      />
    </div>
  );
}; 