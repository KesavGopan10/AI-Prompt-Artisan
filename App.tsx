import React, { useState, useEffect, useCallback } from 'react';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { Favorites } from './components/Favorites';
import { EnhancedPrompts, FavoritePrompt } from './types';
import { enhancePrompt, describeImage, generateCreativeIdea, getStoredApiKey } from './services/geminiService';
import { WandIcon, SparklesIcon, GlobeIcon, LayersIcon, SaveIcon, GitHubIcon, SettingsIcon } from './components/icons';
import SettingsModal from './components/SettingsModal';
import { Analytics } from "@vercel/analytics/react";

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-base-200/40 border border-base-300/20 p-6 rounded-xl flex flex-col items-start gap-4 text-left transition-all duration-300 hover:-translate-y-1 glow-on-hover">
    <div className="bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
      {icon}
    </div>
    <h3 className="font-bold text-lg text-text-primary">{title}</h3>
    <p className="text-sm text-text-secondary">{children}</p>
  </div>
);

const App: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedPrompts, setEnhancedPrompts] = useState<EnhancedPrompts | null>(null);
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([]);
  const [textInput, setTextInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const apiKeyPresent = !!getStoredApiKey();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('promptArtisanFavorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        // Sort by most recent first
        parsedFavorites.sort((a: FavoritePrompt, b: FavoritePrompt) => b.timestamp - a.timestamp);
        setFavorites(parsedFavorites);
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
      setFavorites([]);
    }
  }, []);

  const handleEnhance = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setEnhancedPrompts(null);
    try {
      const result = await enhancePrompt(input);
      setEnhancedPrompts(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDescribeImage = useCallback(async (base64: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setEnhancedPrompts(null);
    try {
      const description = await describeImage(base64);
      // Don't setIsLoading(false) here, because handleEnhance will be called immediately after
      return description;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      setIsLoading(false);
      throw e; // re-throw to be caught in InputArea
    }
  }, []);

  const handleGenerateIdea = useCallback(async () => {
    setIsGeneratingIdea(true);
    setError(null);
    try {
      const idea = await generateCreativeIdea();
      setTextInput(idea);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsGeneratingIdea(false);
    }
  }, []);

  const handleSaveFavorite = useCallback((prompt: string, type: string) => {
    setFavorites(prev => {
      const newFavorite: FavoritePrompt = {
        id: crypto.randomUUID(),
        prompt,
        type,
        timestamp: Date.now(),
      };
      const updatedFavorites = [newFavorite, ...prev];
      localStorage.setItem('promptArtisanFavorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  const handleDeleteFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updatedFavorites = prev.filter(fav => fav.id !== id);
      localStorage.setItem('promptArtisanFavorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  return (
    <div className="min-h-screen text-text-primary font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10 md:mb-16 relative">
          <div className="flex items-center justify-center gap-4">
            <WandIcon className="w-10 h-10 text-brand-primary" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-aurora">AI Prompt Artisan</h1>
            <button
              className="ml-4 p-2 rounded-full hover:bg-base-200 transition-colors absolute right-0 top-0 md:static md:ml-4"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              <SettingsIcon className="w-7 h-7 text-brand-accent" />
            </button>
          </div>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Transform your ideas into powerful, optimized prompts for any AI model.
          </p>
        </header>
        {!apiKeyPresent && (
          <div className="bg-brand-primary/10 border-l-4 border-brand-primary text-brand-primary-dark dark:text-brand-primary p-6 rounded-xl mb-8 flex flex-col items-center shadow-md">
            <div className="font-bold text-xl mb-2 text-brand-primary-dark dark:text-brand-primary">Get Started: Add Your Gemini API Key</div>
            <div className="mb-4 text-center max-w-xl text-brand-primary-dark/80 dark:text-brand-primary/80">
              To use AI Prompt Artisan, you need to provide your own <b>Gemini API key</b>.<br />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-accent underline hover:text-brand-primary font-semibold"
              >
                Create a Gemini API key at Google AI Studio
              </a>
              .
            </div>
            <button
              className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-accent transition-colors shadow"
              onClick={() => setSettingsOpen(true)}
            >
              Open Settings
            </button>
          </div>
        )}

        <section className="mb-10 md:mb-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<LayersIcon className="w-7 h-7 text-brand-accent" />} title="Multi-Modal Input">
              Use text, your voice, or even sketch a drawing. We interpret your raw idea in any form.
            </FeatureCard>
            <FeatureCard icon={<GlobeIcon className="w-7 h-7 text-brand-accent" />} title="Multi-Language Genius">
              Speak or write in your native language. We automatically translate and optimize it into professional English.
            </FeatureCard>
            <FeatureCard icon={<SparklesIcon className="w-7 h-7 text-brand-accent" />} title="Expert Enhancement">
              Our AI applies prompt engineering best practices to craft clear, effective prompts for various models.
            </FeatureCard>
            <FeatureCard icon={<SaveIcon className="w-7 h-7 text-brand-accent" />} title="Save & Reuse">
              Keep a categorized collection of your favorite prompts with one-click saving and copying.
            </FeatureCard>
          </div>
        </section>
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[65vh]">
          <div className="min-h-[50vh] lg:min-h-0">
            <InputArea
              onEnhance={handleEnhance}
              isLoading={isLoading}
              isGeneratingIdea={isGeneratingIdea}
              onDescribeImage={handleDescribeImage}
              onGenerateIdea={handleGenerateIdea}
              textInput={textInput}
              onTextInputChange={setTextInput}
            />
          </div>
          <div className="min-h-[50vh] lg:min-h-0">
            <OutputArea prompts={enhancedPrompts} onSave={handleSaveFavorite} isLoading={isLoading} />
          </div>
        </div>

        <div className="mt-12">
          <Favorites favorites={favorites} onDelete={handleDeleteFavorite} />
        </div>
      </main>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <footer className="text-center p-6 mt-12 text-text-secondary text-sm border-t border-base-300/20">
        <a href="https://github.com/KesavGopan10/AI-Prompt-Artisan" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-brand-accent transition-colors">
          <GitHubIcon className="w-4 h-4" />
          <span>View Project on GitHub</span>
        </a>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;
