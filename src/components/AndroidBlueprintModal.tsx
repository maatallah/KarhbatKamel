import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  FolderTree,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { NATIVE_SNIPPETS, NativeSnippet } from '../utils/nativeCodeSnippets';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface AndroidBlueprintModalProps {
  lang: Language;
}

export const AndroidBlueprintModal: React.FC<AndroidBlueprintModalProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedSnippet, setSelectedSnippet] = useState<NativeSnippet>(NATIVE_SNIPPETS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedSnippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedSnippet.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-3 md:p-5 text-slate-100">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-['Rajdhani'] text-white">
                {t.blueprintTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.blueprintSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 text-xs font-bold transition shadow-md shadow-amber-500/20"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.copied : t.copyCode}</span>
            </button>
            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-bold transition"
            >
              <Download className="h-4 w-4" />
              <span>Download {selectedSnippet.filename}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Code View with File Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Navigator (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani'] pb-2 border-b border-slate-800">
            <FolderTree className="h-4 w-4 text-amber-400" />
            <span>Native Project Hierarchy</span>
          </div>

          <div className="space-y-1.5">
            {NATIVE_SNIPPETS.map((snip) => {
              const isSelected = selectedSnippet.id === snip.id;
              return (
                <button
                  key={snip.id}
                  onClick={() => setSelectedSnippet(snip)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-md ring-1 ring-amber-400/40'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {snip.filename}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 uppercase">
                      {snip.language}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                    {snip.path}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Automotive Hardening Checklist</span>
            </div>
            <p>
              • Explicit <code className="text-amber-300">SoLoader.init()</code> in <code className="text-amber-300">attachBaseContext</code> eliminates <code className="text-rose-400">ExceptionInInitializerError</code>.
            </p>
            <p>
              • <code className="text-amber-300">startForeground(1, notification)</code> executed at start of <code className="text-amber-300">onCreate()</code> passes Android 11 background timeouts.
            </p>
          </div>
        </div>

        {/* Code Content Display (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {selectedSnippet.path}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedSnippet.description}
              </p>
            </div>
            <span className="self-start sm:self-center rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
              Target: Android 11 / API 34
            </span>
          </div>

          {/* Syntax Code Block */}
          <div className="mt-3 flex-1 rounded-xl bg-slate-950 border border-slate-800/80 p-4 overflow-x-auto max-h-[560px]">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed">
              <code>{selectedSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
