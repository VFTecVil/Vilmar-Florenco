import React, { useState } from 'react';
import { GeneratedScript } from '../types';

interface ScriptOutputProps {
  script: GeneratedScript;
}

const OutputSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-brand-red mb-2 pb-1 border-b-2 border-brand-red/30">{title}</h3>
    <div className="text-brand-light space-y-2 prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
      {children}
    </div>
  </div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 bg-brand-hover text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
      aria-label="Copiar para a área de transferência"
    >
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
};


export const ScriptOutput: React.FC<ScriptOutputProps> = ({ script }) => {
  const [isAllCopied, setIsAllCopied] = useState(false);

  const assembleFullScriptText = (script: GeneratedScript): string => {
    const titles = `TÍTULOS\n${script.titles.join('\n')}`;
    const hook = `HOOK\n${script.hook}`;
    const intro = `INTRODUÇÃO\n${script.introduction}`;
    const mainContent = `CONTEÚDO PRINCIPAL\n${script.mainContent.map(p => `Parte ${p.part}\n${p.content}`).join('\n\n')}`;
    const conclusion = `CONCLUSÃO\n${script.conclusion}`;
    const description = `DESCRIÇÃO DO VÍDEO\n${script.videoDescription}`;
    const keywords = `PALAVRAS-CHAVE\n${script.keywords}`;
    const thumbnails = `IDEIAS PARA THUMBNAILS\n${script.thumbnailTexts.map((text, index) => 
      `Opção ${index + 1}\nTexto: "${text}"\nPrompt de Imagem: ${script.thumbnailPrompts[index]}`
    ).join('\n\n')}`;
    
    return [titles, hook, intro, mainContent, conclusion, description, keywords, thumbnails].join('\n\n---\n\n');
  };
  
  const allTitles = script.titles.join('\n');
  const fullMainContent = script.mainContent.map(part => `Parte ${part.part}\n${part.content}`).join('\n\n');
  const fullScriptText = assembleFullScriptText(script);
  
  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullScriptText).then(() => {
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 2000);
    }).catch(err => console.error('Failed to copy all text: ', err));
  };


  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-end mb-4 -mt-2">
        <button
          onClick={handleCopyAll}
          className="bg-brand-red text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-all duration-200 text-sm shadow-md"
        >
          {isAllCopied ? 'Copiado!' : 'Copiar Roteiro Completo'}
        </button>
      </div>
      
      <OutputSection title="Opções de Título">
        <div className="relative group">
          <CopyButton textToCopy={allTitles} />
          <ul className="list-disc list-inside">
            {script.titles.map((title, index) => <li key={index}>{title}</li>)}
          </ul>
        </div>
      </OutputSection>

      <OutputSection title="Hook (Início do Vídeo)">
        <div className="relative group">
          <CopyButton textToCopy={script.hook} />
          <p>{script.hook}</p>
        </div>
      </OutputSection>
      
      <OutputSection title="Introdução">
        <div className="relative group">
          <CopyButton textToCopy={script.introduction} />
          <p>{script.introduction}</p>
        </div>
      </OutputSection>

      <OutputSection title="Conteúdo Principal">
        <div className="relative group">
          <CopyButton textToCopy={fullMainContent} />
          {script.mainContent.map((part) => (
            <div key={part.part} className="mb-4">
              <h4 className="font-semibold text-gray-300">Parte {part.part}</h4>
              <p>{part.content}</p>
            </div>
          ))}
        </div>
      </OutputSection>
      
      <OutputSection title="Conclusão e CTAs Finais">
        <div className="relative group">
          <CopyButton textToCopy={script.conclusion} />
          <p>{script.conclusion}</p>
        </div>
      </OutputSection>

      <OutputSection title="Descrição do Vídeo (Para o YouTube)">
        <div className="bg-brand-light-dark p-3 rounded-md relative group">
          <CopyButton textToCopy={script.videoDescription} />
          <p className="whitespace-pre-wrap">{script.videoDescription}</p>
        </div>
      </OutputSection>
      
      <OutputSection title="Palavras-chave">
        <div className="bg-brand-light-dark p-3 rounded-md relative group">
          <CopyButton textToCopy={script.keywords} />
          <p className="text-sm">{script.keywords}</p>
        </div>
      </OutputSection>

      <OutputSection title="Ideias para Thumbnails">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {script.thumbnailTexts.map((text, index) => {
            const thumbnailContent = `Texto: "${text}"\nPrompt de Imagem: ${script.thumbnailPrompts[index]}`;
            return (
              <div key={index} className="bg-brand-light-dark p-3 rounded-md relative group">
                <CopyButton textToCopy={thumbnailContent} />
                <h5 className="font-bold text-gray-400 mb-1">Opção {index + 1}</h5>
                <p className="font-semibold mb-2"><strong>Texto:</strong> "{text}"</p>
                <p className="text-sm text-gray-400"><strong>Prompt de Imagem:</strong> {script.thumbnailPrompts[index]}</p>
              </div>
            );
          })}
        </div>
      </OutputSection>
    </div>
  );
};