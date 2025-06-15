import React from 'react';
import WordCloud from 'react-d3-cloud';
import { ParsedData } from '../../../types';

interface ReviewWordCloudProps {
  data: ParsedData['data'];
}

// Basic list of English stop words
const stopWords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'a', 'an', 'the',
  'and', 'but', 'if', 'or', 'because', 'as', 'of', 'at', 'by', 'for', 'with', 'about', 'to', 'from',
  'in', 'out', 'on', 'off', 'was', 'were', 'is', 'are', 'am', 'it', 'its', 'this', 'that', 'very',
  'place', 'room', 'service', 'staff', 'time', 'order', 'people', 'had', 'not', 'even', 'care', 
  'properly', 'without', 'like', 'has', 'have', 'good', 'there', 'one', 'don\'t', 'over', 'some',
  // New additions from word cloud analysis
  'they', 'all', 'when', 'which', 'who', 'only', 'here', 'also', 'could', 'after', 'get', 'any',
  'their', 'more', 'both', 'top', 'anyone', 'overall', 'took', 'open', 'night', 'visit', 'went',
  'through', 'given', 'came', 'calling', 'allowed', 'inside', 'making', 'extremely'
]);

// Function to process text and generate word frequencies
const generateWordFrequencies = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:()"]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopWords.has(word)); // Filter out short words and stop words

  const frequencies: { [key: string]: number } = {};
  words.forEach(word => {
    frequencies[word] = (frequencies[word] || 0) + 1;
  });

  return Object.entries(frequencies).map(([text, value]) => ({ text, value }));
};

export const ReviewWordCloud: React.FC<ReviewWordCloudProps> = ({ data }) => {
  console.log('📊 [ReviewWordCloud] Received raw data:', data);

  let actualFeatures: any[] = [];
  if (Array.isArray(data) && data.length > 0 && data[0] && data[0].type === 'FeatureCollection' && Array.isArray(data[0].features)) {
    actualFeatures = data[0].features;
  } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    actualFeatures = data.features;
  } else if (Array.isArray(data)) {
    actualFeatures = data;
  }
  console.log(`📊 [ReviewWordCloud] Extracted ${actualFeatures.length} features for processing.`);

  const reviewText = actualFeatures.reduce((acc, item) => {
    const rating = item.properties?.five_star_rating_published;
    const text = item.properties?.review_text_published;

    if (text && typeof text === 'string') {
      if (rating === 1) acc.oneStar += ` ${text}`;
      else if (rating === 5) acc.fiveStar += ` ${text}`;
    }
    return acc;
  }, { oneStar: '', fiveStar: '' });

  // Memoize the generated word lists to prevent unnecessary re-renders of the data prop itself
  const oneStarWords = React.useMemo(() => 
    generateWordFrequencies(reviewText.oneStar).sort((a, b) => b.value - a.value).slice(0, 75)
  , [reviewText.oneStar]);

  const fiveStarWords = React.useMemo(() => 
    generateWordFrequencies(reviewText.fiveStar).sort((a, b) => b.value - a.value).slice(0, 75)
  , [reviewText.fiveStar]);

  console.log(`📊 [ReviewWordCloud] Processed into ${oneStarWords.length} 1-star words and ${fiveStarWords.length} 5-star words.`);
  
  const FONT_FAMILY = 'Inter var, sans-serif';

  // Define fixed dimensions for the word clouds
  // Reduced width to prevent overflow within the card's two-column layout
  const FIXED_WORDCLOUD_WIDTH = 300; 
  const FIXED_WORDCLOUD_HEIGHT = 350; // Keep height consistent

  // A simple font size mapper as suggested in react-d3-cloud documentation
  const fontSizeMapper = (word: { value: number }) => Math.log2(word.value) * 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Ensure inner divs take full height */}
      <div className="h-full">
        <h3 className="text-lg font-semibold text-center mb-2">Most Common Words in 1★ Reviews</h3>
        {oneStarWords.length > 0 ? (
          <WordCloud
            data={oneStarWords}
            width={FIXED_WORDCLOUD_WIDTH}
            height={FIXED_WORDCLOUD_HEIGHT}
            font={FONT_FAMILY}
            fontSize={fontSizeMapper}
            rotate={0}
            padding={2}
          />
        ) : (
          <p className="text-center text-muted-foreground pt-16">No 1-star review text found.</p>
        )}
      </div>
      <div className="h-full">
        <h3 className="text-lg font-semibold text-center mb-2">Most Common Words in 5★ Reviews</h3>
        {fiveStarWords.length > 0 ? (
          <WordCloud
            data={fiveStarWords}
            width={FIXED_WORDCLOUD_WIDTH}
            height={FIXED_WORDCLOUD_HEIGHT}
            font={FONT_FAMILY}
            fontSize={fontSizeMapper}
            rotate={0}
            padding={2}
          />
        ) : (
          <p className="text-center text-muted-foreground pt-16">No 5-star review text found.</p>
        )}
      </div>
    </div>
  );
}; 