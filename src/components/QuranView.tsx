import React from 'react';
import { CompleteQuranSection } from './CompleteQuranSection';

interface QuranViewProps {
  bookmarkedAyahs: string[];
  onToggleBookmark: (verseKey: string) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  bookmarkedAyahs,
  onToggleBookmark,
}) => {
  return (
    <div className="space-y-6">
      <CompleteQuranSection
        bookmarkedAyahs={bookmarkedAyahs}
        onToggleBookmark={onToggleBookmark}
      />
    </div>
  );
};
