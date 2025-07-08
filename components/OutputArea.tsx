import React, { useState } from 'react';
import { EnhancedPrompts } from '../types';
import { CopyIcon, SaveIcon, CheckIcon, WandIcon, SparklesIcon } from './icons';

interface OutputAreaProps {
  prompts: EnhancedPrompts | null;
  onSave: (prompt: string, type: string) => void;
  isLoading: boolean;
}

const PromptCard: React.FC<{
  title: string;
  content: string;
  onSave: (prompt: string, type: string) => void;
  style?: React.CSSProperties;
}> = ({ title, content, onSave, style }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(content, title);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="bg-base-200/60 p-4 rounded-lg border border-base-300/30 hover:border-brand-accent/50 transition-all group fade-in-item"
      style={style}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-brand-accent">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="p-2 text-text-secondary hover:text-brand-primary transition-colors disabled:text-base-300 rounded-full hover:bg-base-300/50"
            title="Save Prompt"
            disabled={saved}
          >
            {saved ? <CheckIcon className="w-5 h-5 text-brand-primary" /> : <SaveIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-text-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-base-300/50"
            title="Copy to Clipboard"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-brand-primary" /> : <CopyIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="text-text-secondary bg-base-100/70 p-3 rounded text-sm whitespace-pre-wrap font-mono">
        {content}
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-base-200/60 p-4 rounded-lg border border-base-300/30 animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="h-6 w-1/3 bg-base-300 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-base-300 rounded-full"></div>
        <div className="h-8 w-8 bg-base-300 rounded-full"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-base-300 rounded"></div>
      <div className="h-4 bg-base-300 w-5/6 rounded"></div>
      <div className="h-4 bg-base-300 w-3/4 rounded"></div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-text-secondary p-8">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <SparklesIcon className="absolute top-0 left-0 w-8 h-8 text-brand-accent opacity-50 animate-pulse" style={{animationDelay: '0.2s'}} />
        <SparklesIcon className="absolute bottom-2 right-0 w-12 h-12 text-brand-primary opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}/>
        <WandIcon className="w-24 h-24 mx-auto opacity-10" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Your Enhanced Prompts Will Appear Here</h2>
      <p className="mt-2 max-w-sm mx-auto">Use the panel on the left to write, speak, or draw your idea, and watch the magic happen.</p>
    </div>
  </div>
);

export const OutputArea: React.FC<OutputAreaProps> = ({ prompts, onSave, isLoading }) => {
  return (
    <div className="bg-base-200/40 backdrop-blur-md border border-base-300/20 rounded-xl h-full overflow-hidden">
      <div className="h-full p-4">
        {isLoading ? (
          <div className="space-y-4 h-full">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !prompts ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 h-full overflow-y-auto">
            <PromptCard title="Generic" content={prompts.generic} onSave={onSave} style={{ animationDelay: '0ms' }} />
            <PromptCard title="Chatbot" content={prompts.chatbot} onSave={onSave} style={{ animationDelay: '100ms' }}/>
            <PromptCard title="Image Generation" content={prompts.image_generation} onSave={onSave} style={{ animationDelay: '200ms' }}/>
          </div>
        )}
      </div>
    </div>
  );
};
