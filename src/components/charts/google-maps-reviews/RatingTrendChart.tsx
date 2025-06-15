import React, { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ParsedData } from '../../../types';
import { nivoTheme } from './theme';

interface RatingTrendChartProps {
  data: ParsedData['data'];
}

interface MonthlyRatingData {
  '1_star': number;
  '2_star': number;
  '3_star': number;
  '4_star': number;
  '5_star': number;
  month: string;
  [key: string]: number | string;
}

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ data }) => {
  const allStarRatingKeys = ['1_star', '2_star', '3_star', '4_star', '5_star'];
  const [activeStarRatings, setActiveStarRatings] = useState<string[]>(allStarRatingKeys);

  console.log('📊 [RatingTrendChart] Received raw data:', data);
  
  let actualFeatures: any[] = [];
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  
  console.log(`📊 [RatingTrendChart] Extracted ${actualFeatures.length} features for processing.`);

  const monthlyRatings: { [key: string]: MonthlyRatingData } = {};

  actualFeatures.forEach((item: any) => {
    if (!item.properties || !item.properties.date || item.properties.five_star_rating_published === undefined) {
      return;
    }

    const { date, five_star_rating_published } = item.properties;

    if (typeof date !== 'string' || isNaN(new Date(date).getTime())) {
      return;
    }

    let numericRating: number;
    if (typeof five_star_rating_published === 'string') {
      numericRating = Number(five_star_rating_published);
    } else if (typeof five_star_rating_published === 'number') {
      numericRating = five_star_rating_published;
    } else {
      return;
    }

    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return;
    }

    const reviewDate = new Date(date);
    const yearMonth = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}`;
    const ratingKey = `${numericRating}_star`;

    if (!monthlyRatings[yearMonth]) {
      monthlyRatings[yearMonth] = {
        '1_star': 0, '2_star': 0, '3_star': 0, '4_star': 0, '5_star': 0,
        month: yearMonth
      };
    }
    (monthlyRatings[yearMonth] as any)[ratingKey]++;
  });

  const chartData = Object.values(monthlyRatings).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });
  
  console.log(`📊 [RatingTrendChart] Processed data into ${chartData.length} monthly aggregates for the chart.`);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No valid rating trend data available for charting based on the expected format.
        <br />
        Please ensure your uploaded data contains Google Map Reviews in a GeoJSON FeatureCollection format
        with `date` and `five_star_rating_published` properties within each feature's `properties` object.
      </div>
    );
  }

  const handleCheckboxChange = (checked: boolean, starRatingKey: string) => {
    setActiveStarRatings(prev => {
      if (checked) {
        return [...prev, starRatingKey].sort((a, b) => Number(a[0]) - Number(b[0]));
      } else {
        return prev.filter(key => key !== starRatingKey);
      }
    });
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <span className="font-semibold">Filter by Rating:</span>
        {allStarRatingKeys.map(key => (
          <div key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={key}
              checked={activeStarRatings.includes(key)}
              onChange={(e) => handleCheckboxChange(e.target.checked, key)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={key} className="text-sm font-medium text-gray-700">
              {key.replace('_star', ' Star')}
            </label>
          </div>
        ))}
      </div>

      <div style={{ height: 400 }}>
        <ResponsiveBar
          data={chartData}
          keys={activeStarRatings}
          indexBy="month"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="stacked"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'set2' }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: 'Month',
            legendPosition: 'middle',
            legendOffset: 45,
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
          role="application"
          ariaLabel="Google Map Reviews Rating Trend Chart"
        />
      </div>
    </div>
  );
}; 