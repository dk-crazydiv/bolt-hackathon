import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ParsedData } from '../../../types';
import { nivoTheme } from './theme';

interface RatingDistributionChartProps {
  data: ParsedData['data'];
}

export const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({ data }) => {
  console.log('📊 [RatingDistributionChart] Received raw data:', data);

  let actualFeatures: any[] = [];
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  
  console.log(`📊 [RatingDistributionChart] Extracted ${actualFeatures.length} features for processing.`);

  const ratingCounts = actualFeatures.reduce((acc: { [key: string]: number }, item: any) => {
    const rating = item.properties?.five_star_rating_published;
    if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
      const ratingKey = `${rating} star`;
      acc[ratingKey] = (acc[ratingKey] || 0) + 1;
    } else if (typeof rating === 'string') {
      const numericRating = Number(rating);
      if (!isNaN(numericRating) && numericRating >= 1 && numericRating <= 5) {
        const ratingKey = `${numericRating} star`;
        acc[ratingKey] = (acc[ratingKey] || 0) + 1;
      }
    }
    return acc;
  }, {});

  const chartData = Object.entries(ratingCounts).map(([id, value]) => ({
    id,
    label: id,
    value,
  }));
  
  console.log(`📊 [RatingDistributionChart] Processed into ${chartData.length} rating categories.`);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No valid rating data could be found to generate a distribution chart.
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        theme={nivoTheme}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
      />
    </div>
  );
}; 