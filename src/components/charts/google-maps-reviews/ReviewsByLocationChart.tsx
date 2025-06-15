import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ParsedData } from '../../../types';
import { nivoTheme } from './theme';

interface ReviewsByLocationChartProps {
  data: ParsedData['data'];
  groupBy: 'country';
}

export const ReviewsByLocationChart: React.FC<ReviewsByLocationChartProps> = ({ data, groupBy }) => {
  console.log('📊 [ReviewsByLocationChart] Received raw data:', data);
  
  let actualFeatures: any[] = [];

  // Data extraction logic, similar to RatingTrendChart
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  
  console.log(`📊 [ReviewsByLocationChart] Extracted ${actualFeatures.length} features for processing.`);

  const locationCounts = actualFeatures.reduce((acc: { [key: string]: number }, item: any) => {
    if (!item.properties || !item.properties.location) {
      return acc; // Skip items without location properties
    }

    // Only group by country code as determined.
    const locationKey = item.properties.location.country_code;

    if (locationKey && typeof locationKey === 'string') {
      acc[locationKey] = (acc[locationKey] || 0) + 1;
    }
    return acc;
  }, {});


  const chartData = Object.entries(locationCounts)
    .map(([location, count]) => ({
      location,
      count: count as number,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Top 15 locations

  console.log(`📊 [ReviewsByLocationChart] Processed into ${chartData.length} locations for the chart. Top location:`, chartData[0] || 'N/A');

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No valid location data available for charting based on the expected format
        (missing 'country_code' in properties.location, or no data for charting).
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={chartData}
        keys={['count']}
        indexBy="location"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45, // Rotate labels for better readability
          legend: 'Country Code', // Legend fixed to Country Code
          legendPosition: 'middle',
          legendOffset: 50, // Adjusted offset for rotation
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
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        theme={nivoTheme}
      />
    </div>
  );
}; 