import React from 'react';
import { ParsedData } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Award, Frown, CalendarDays, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AdvancedStatsProps {
  data: ParsedData['data'];
}

// Helper function to parse address for city
const parseCity = (address: string): string | null => {
  if (!address || typeof address !== 'string') return null;
  const parts = address.split(',').map(part => part.trim());
  if (parts.length < 3) return null;
  return parts[parts.length - 3].trim();
};

export const AdvancedStats: React.FC<AdvancedStatsProps> = ({ data }) => {
  console.log('📊 [AdvancedStats] Received raw data:', data);

  let actualFeatures: any[] = [];
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  console.log(`📊 [AdvancedStats] Extracted ${actualFeatures.length} features for processing.`);

  const { best, worst, streaks } = React.useMemo(() => {
    // --- 1. Best/Worst Rated Location Calculation ---
    const locationRatings: { [key: string]: { sum: number; count: number } } = {};
    actualFeatures.forEach(item => {
      const rating = Number(item.properties?.five_star_rating_published);
      const city = parseCity(item.properties?.location?.address);
      if (city && !isNaN(rating)) {
        if (!locationRatings[city]) locationRatings[city] = { sum: 0, count: 0 };
        locationRatings[city].sum += rating;
        locationRatings[city].count++;
      }
    });

    const locationAverages = Object.entries(locationRatings)
      .filter(([, { count }]) => count > 1) // Only consider locations with more than 1 review
      .map(([name, { sum, count }]) => ({ name, avg: sum / count }));
    
    const best = locationAverages.length > 0 ? locationAverages.reduce((max, loc) => loc.avg > max.avg ? loc : max, locationAverages[0]) : null;
    const worst = locationAverages.length > 0 ? locationAverages.reduce((min, loc) => loc.avg < min.avg ? loc : min, locationAverages[0]) : null;

    // --- 2. Streak Calculation ---
    const reviewDates = actualFeatures
      .map(item => new Date(item.properties?.date))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    let longestStreakStart = null;
    let longestStreakEnd = null;
    let longestGap = 0;
    let longestGapStart = null;
    let longestGapEnd = null;

    if (reviewDates.length > 1) {
      const oneDay = 24 * 60 * 60 * 1000;
      let currentStreak = 1;
      let currentStreakStart = reviewDates[0];
      
      for (let i = 1; i < reviewDates.length; i++) {
        const diffDays = Math.round(Math.abs((reviewDates[i].getTime() - reviewDates[i-1].getTime()) / oneDay));
        
        if (diffDays <= 7) { // Within a week, continue streak
          currentStreak++;
        } else { // Streak broken
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakStart = currentStreakStart;
            longestStreakEnd = reviewDates[i-1];
          }
          currentStreak = 1; // Reset streak
          currentStreakStart = reviewDates[i];
        }

        if (diffDays > longestGap) {
          longestGap = diffDays;
          longestGapStart = reviewDates[i-1];
          longestGapEnd = reviewDates[i];
        }
      }
      // Final check for the last running streak
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStreakStart = currentStreakStart;
        longestStreakEnd = reviewDates[reviewDates.length - 1];
      }
    }

    const formatDate = (date: Date | null) => date ? date.toLocaleDateString() : 'N/A';

    return { 
      best, 
      worst, 
      streaks: { 
        longest: longestStreak, 
        longestGap: Math.round(longestGap / 7),
        longestStreakDisplay: `${formatDate(longestStreakStart)} - ${formatDate(longestStreakEnd)}`,
        longestGapDisplay: `${formatDate(longestGapStart)} - ${formatDate(longestGapEnd)}`,
      } 
    };
  }, [data]);
  
  console.log('📊 [AdvancedStats] Calculated Stats:', { best, worst, streaks });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Rated City</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{best ? `${best.name} (${best.avg.toFixed(1)}★)` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">Highest avg rating (min 2 reviews)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worst Rated City</CardTitle>
          <Frown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{worst && worst.name !== best?.name ? `${worst.name} (${worst.avg.toFixed(1)}★)` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">Lowest avg rating (min 2 reviews)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Review Streak</CardTitle>
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streaks.longest > 1 ? `${streaks.longest} reviews` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">{streaks.longest > 1 ? streaks.longestStreakDisplay : 'Consecutive reviews within a 7-day period'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Review Gap</CardTitle>
          <ThumbsDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streaks.longestGap > 0 ? `${streaks.longestGap} weeks` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">{streaks.longestGap > 0 ? streaks.longestGapDisplay : 'Longest period without giving any reviews'}</p>
        </CardContent>
      </Card>
    </div>
  );
}; 