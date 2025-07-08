import React, { useState, useRef, useCallback } from 'react';
import { InputMode } from '../types';
import { TypeIcon, MicrophoneIcon, PencilIcon, StopCircleIcon, WandIcon, TrashIcon, LightbulbIcon } from './icons';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface InputAreaProps {
  onEnhance: (input: string) => void;
  isLoading: boolean;
  isGeneratingIdea: boolean;
  onDescribeImage: (base64: string) => Promise<string>;
  onGenerateIdea: () => void;
  textInput: string;
  onTextInputChange: (value: string) => void;
}

const supportedLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español (España)' },
  { code: 'zh-CN', name: '中文 (Mandarin, Simplified)' },
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'ur-IN', name: 'اردو (Urdu, India)' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' },
];

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
      isActive
        ? 'text-brand-accent'
        : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    {icon}
    <span>{label}</span>
    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent glow-on-hover"></div>}
  </button>
);

export const InputArea: React.FC<InputAreaProps> = ({ onEnhance, isLoading, isGeneratingIdea, onDescribeImage, onGenerateIdea, textInput, onTextInputChange }) => {
  const [activeTab, setActiveTab] = useState<InputMode>(InputMode.Text);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  const [isDrawingDirty, setIsDrawingDirty] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasRef>(null);

  const handleTranscript = useCallback((transcript: string) => {
    onTextInputChange(textInput ? `${textInput} ${transcript}` : transcript);
  }, [textInput, onTextInputChange]);

  const { isListening, error: speechError, startListening, stopListening } = useSpeechRecognition({
    onTranscriptReady: handleTranscript,
    lang: speechLanguage,
  });

  const handleSubmit = async () => {
    if (isLoading) return;

    if (activeTab === InputMode.Text || activeTab === InputMode.Voice) {
      if (textInput.trim()) {
        onEnhance(textInput);
      }
    } else if (activeTab === InputMode.Draw) {
        const imageData = drawingCanvasRef.current?.getImageData();
        if (imageData) {
            try {
                const description = await onDescribeImage(imageData);
                onTextInputChange(description); // Set text input for user to see
                onEnhance(description);
            } catch (e) {
                // Error is handled in App.tsx
            }
        }
    }
  };
  
  const clearInputs = () => {
    onTextInputChange('');
    if(drawingCanvasRef.current) {
        drawingCanvasRef.current.clearCanvas();
    }
    setIsDrawingDirty(false);
  }

  const renderInput = () => {
    switch (activeTab) {
      case InputMode.Draw:
        return (
          <div className="h-full flex flex-col p-1">
            <DrawingCanvas ref={drawingCanvasRef} onDrawEnd={(isEmpty) => setIsDrawingDirty(!isEmpty)} />
          </div>
        );
      case InputMode.Voice:
        return (
          <div className="h-full flex flex-col justify-between">
            <textarea
              value={textInput}
              onChange={(e) => onTextInputChange(e.target.value)}
              placeholder="Your transcribed text will appear here... or type to edit."
              className="w-full flex-grow p-4 bg-transparent text-text-primary placeholder-text-secondary focus:outline-none resize-none"
            />
            <div className="p-4 flex flex-col items-center gap-4 border-t border-base-300/20">
                <div className="w-full max-w-xs">
                    <label htmlFor="lang-select" className="block text-sm font-medium text-text-secondary mb-1 text-center">Recognition Language</label>
                    <select
                      id="lang-select"
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value)}
                      disabled={isListening}
                      className="w-full bg-base-300 border-2 border-base-300/50 text-text-primary text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2.5 transition"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary text-white hover:bg-brand-secondary'}`}
                    >
                        {isListening ? <StopCircleIcon className="w-8 h-8"/> : <MicrophoneIcon className="w-8 h-8" />}
                    </button>
                    <p className="text-sm text-text-secondary h-4">{isListening ? 'Recording...' : speechError || 'Click to start recording'}</p>
                </div>
            </div>
          </div>
        );
      case InputMode.Text:
      default:
        return (
          <textarea
            value={textInput}
            onChange={(e) => onTextInputChange(e.target.value)}
            placeholder="Describe your idea in any language, and we'll craft the perfect prompt..."
            className="w-full h-full p-4 bg-transparent text-text-primary placeholder-text-secondary focus:outline-none resize-none"
          />
        );
    }
  };

  const isSubmitDisabled = isLoading || (activeTab !== InputMode.Draw && !textInput.trim()) || (activeTab === InputMode.Draw && !isDrawingDirty);

  return (
    <div className="bg-base-200/40 backdrop-blur-md border border-base-300/20 rounded-xl shadow-2xl shadow-black/20 flex flex-col h-full">
      <div className="flex border-b border-base-300/20 px-2">
        <TabButton label="Text" icon={<TypeIcon className="w-5 h-5" />} isActive={activeTab === InputMode.Text} onClick={() => setActiveTab(InputMode.Text)} />
        <TabButton label="Voice" icon={<MicrophoneIcon className="w-5 h-5" />} isActive={activeTab === InputMode.Voice} onClick={() => setActiveTab(InputMode.Voice)} />
        <TabButton label="Draw" icon={<PencilIcon className="w-5 h-5" />} isActive={activeTab === InputMode.Draw} onClick={() => setActiveTab(InputMode.Draw)} />
      </div>
      <div className="flex-grow min-h-0">
        {renderInput()}
      </div>
      <div className="p-4 border-t border-base-300/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <button
                onClick={clearInputs}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-base-300/50"
                title="Clear Input"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onGenerateIdea}
                disabled={isGeneratingIdea || isLoading}
                className="p-2 text-text-secondary hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-base-300/50"
                title="Generate Idea"
            >
                {isGeneratingIdea ? <div className="w-5 h-5 border-2 border-t-transparent border-brand-accent rounded-full animate-spin"></div> : <LightbulbIcon className="w-5 h-5" />}
            </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-grow flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold rounded-lg shadow-lg hover:shadow-brand-primary/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Enhancing...</span>
            </>
          ) : (
            <>
                <WandIcon className="w-6 h-6" />
                <span className="text-lg">Enhance Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};