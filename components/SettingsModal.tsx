import React, { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_AI_STUDIO_URL = 'https://aistudio.google.com/app/apikey';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey() || '');
      setSaved(false);
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty.');
      return;
    }
    setStoredApiKey(apiKey.trim());
    setSaved(true);
    setError('');
    setTimeout(() => setSaved(false), 1500);
  };

  const copyApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 border border-gray-700/60 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center glass animate-fade-in"
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 hover:bg-red-500/70 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="space-y-6 w-full">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Gemini API Settings
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter your Gemini API key to start generating Prompts with AI.
                </p>
              </div>

              <div className="w-full p-4 bg-gray-800/60 rounded-lg border border-gray-700/60">
                <h3 className="text-sm font-medium text-cyan-300">Need an API Key?</h3>
                <div className="mt-2 text-gray-400 text-xs">
                  <p className="mb-2">
                    Don't have an API key yet? Follow these simple steps:
                  </p>
                  <ol className="list-decimal list-inside mb-2">
                    <li>Visit Google AI Studio</li>
                    <li>Create a new project</li>
                    <li>Generate your API key</li>
                    <li>Paste it below</li>
                  </ol>
                  <a
                    href={GOOGLE_AI_STUDIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-200 underline font-semibold"
                  >
                    Get API Key →
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-cyan-200">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={e => {
                      setApiKey(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your Gemini API key"
                    className={`w-full px-3 py-2 border border-gray-700 bg-gray-900/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-500 transition-all duration-200 ${
                      error ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {apiKey && (
                    <button
                      onClick={copyApiKey}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white bg-gray-800/60 hover:bg-cyan-600 rounded-full p-1.5 transition-colors"
                      aria-label="Copy API key"
                    >
                      {isCopied ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-400 text-sm">{error}</span>
                  </motion.div>
                )}

                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 text-sm">API key saved successfully!</span>
                  </motion.div>
                )}
              </div>

              <motion.button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                whileTap={{ scale: 0.97 }}
                className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
                  ${apiKey.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                    : 'bg-gray-600 cursor-not-allowed'}
                `}
              >
                {apiKey.trim() ? "Save API Key" : "Enter API Key to Continue"}
              </motion.button>

              <div className="text-xs text-gray-500 text-center">
                Your API key is encrypted and stored only in your browser.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;