import React, { useState } from 'react';
import { FavoritePrompt } from '../types';
import { CopyIcon, CheckIcon, TrashIcon, SaveIcon } from './icons';

interface FavoritesProps {
  favorites: FavoritePrompt[];
  onDelete: (id: string) => void;
}

const FavoriteItem: React.FC<{
  favorite: FavoritePrompt;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}> = ({ favorite, onDelete, style }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(favorite.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-base-200/60 p-3 rounded-lg flex items-start gap-4 transition-all border border-transparent hover:border-base-300/50 hover:bg-base-300/30 fade-in-item" style={style}>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-brand-primary/20 text-brand-accent rounded-full">{favorite.type}</span>
          <span className="text-xs text-text-secondary">{new Date(favorite.timestamp).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-text-primary font-mono whitespace-pre-wrap">{favorite.prompt}</p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="p-2 text-text-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-base-300/50"
          title="Copy to Clipboard"
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDelete(favorite.id)}
          className="p-2 text-text-secondary hover:text-red-500 transition-colors rounded-full hover:bg-base-300/50"
          title="Delete Favorite"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const Favorites: React.FC<FavoritesProps> = ({ favorites, onDelete }) => {
  if (favorites.length === 0) {
    return (
        <div className="text-center py-12 text-text-secondary bg-base-200/30 rounded-lg border border-base-300/20">
            <SaveIcon className="w-12 h-12 mx-auto mb-4 opacity-20"/>
            <p className="font-semibold text-text-primary">No Saved Prompts Yet</p>
            <p className="text-sm">Click the save icon on a generated prompt to keep it here.</p>
        </div>
    )
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Saved Prompts</h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 -mr-2">
        {favorites.map((fav, index) => (
          <FavoriteItem 
            key={fav.id} 
            favorite={fav} 
            onDelete={onDelete} 
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
};