import React, { useState, useCallback } from 'react';
import { generateScript } from './services/geminiService';
import { GeneratedScript } from './types';
import { VIDEO_LENGTH_OPTIONS, LANGUAGE_OPTIONS } from './constants';
import { YouTubeIcon } from './components/icons/YouTubeIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { ScriptOutput } from './components/ScriptOutput';
import { FormControl } from './components/FormControl';

const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [playlist, setPlaylist] = useState('');
  const [videoLength, setVideoLength] = useState(Object.keys(VIDEO_LENGTH_OPTIONS)[0]);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[6].value); // Default to Portuguese_BR

  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!title) {
      setError('Por favor, insira um tema ou título para o vídeo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const script = await generateScript({
        title,
        channelName,
        channelDescription,
        playlist,
        videoLength: VIDEO_LENGTH_OPTIONS[videoLength as keyof typeof VIDEO_LENGTH_OPTIONS],
        language,
      });
      setGeneratedScript(script);
    } catch (err) {
      setError(err instanceof Error ? `Falha ao gerar o roteiro: ${err.message}` : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [title, channelName, channelDescription, playlist, videoLength, language]);

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <header className="bg-brand-medium-dark p-4 border-b border-brand-hover flex items-center justify-center space-x-3">
        <YouTubeIcon className="h-8 w-8 text-brand-red" />
        <h1 className="text-2xl font-bold text-white">Gerador de Roteiro para YouTube com IA</h1>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-medium-dark p-6 rounded-lg shadow-lg flex flex-col space-y-6 h-fit">
          <h2 className="text-xl font-semibold text-white border-b border-brand-hover pb-3">Detalhes do Vídeo</h2>
          
          <FormControl label="Tema ou Título do Vídeo" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como fazer o melhor café em casa"
              className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition"
            />
          </FormControl>

          <FormControl label="Nome do Canal">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Ex: Café com Entusiastas"
              className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition"
            />
          </FormControl>

          <FormControl label="Descrição do Canal">
            <textarea
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              placeholder="Descreva sobre o que é o seu canal. Isso ajuda a IA a entender seu público e tom."
              rows={4}
              className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition resize-y"
            />
          </FormControl>

          <FormControl label="Playlist">
            <input
              type="text"
              value={playlist}
              onChange={(e) => setPlaylist(e.target.value)}
              placeholder="Ex: Tutoriais de Café"
              className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition"
            />
          </FormControl>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl label="Tamanho do Vídeo">
              <select
                value={videoLength}
                onChange={(e) => setVideoLength(e.target.value)}
                className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition"
              >
                {Object.entries(VIDEO_LENGTH_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </FormControl>

            <FormControl label="Idioma">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-brand-light-dark border border-brand-hover rounded-md p-2 focus:ring-2 focus:ring-brand-red focus:outline-none transition"
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </FormControl>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !title}
            className="w-full flex items-center justify-center bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg"
          >
            {isLoading ? <SpinnerIcon /> : 'Gerar Roteiro'}
          </button>
        </div>

        <div className="bg-brand-medium-dark p-6 rounded-lg shadow-lg">
           <h2 className="text-xl font-semibold text-white border-b border-brand-hover pb-3 mb-4">Roteiro Gerado</h2>
           {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-brand-gray">
              <SpinnerIcon />
              <p className="mt-4 text-lg">Gerando seu roteiro... Isso pode levar um momento.</p>
            </div>
           )}
           {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
           )}
           {generatedScript && !isLoading && (
            <ScriptOutput script={generatedScript} />
           )}
           {!generatedScript && !isLoading && !error && (
             <div className="flex flex-col items-center justify-center h-full text-center text-brand-gray p-8 border-2 border-dashed border-brand-hover rounded-lg">
                <p className="text-lg">Seu roteiro aparecerá aqui.</p>
                <p className="mt-2">Preencha os detalhes ao lado e clique em "Gerar Roteiro" para começar.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;