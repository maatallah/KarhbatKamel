import React, { useState, useRef } from 'react';
import {
  Library,
  Upload,
  Play,
  Pause,
  Disc3,
  Search,
  Music2,
  HardDrive,
  FileAudio,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Track, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { DEFAULT_TRACKS } from '../utils/audioSynth';

interface MediaLibraryProps {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onAddTracks: (newTracks: Track[]) => void;
  onRemoveTrack: (id: string) => void;
  lang: Language;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onAddTracks,
  onRemoveTrack,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newTracks: Track[] = [];
    const colorGradients = [
      'from-indigo-600 via-purple-600 to-pink-700',
      'from-cyan-600 via-blue-700 to-indigo-900',
      'from-amber-600 via-rose-700 to-purple-900',
      'from-emerald-600 via-teal-700 to-slate-900',
    ];

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|flac|ogg|m4a|aac)$/i)) {
        return;
      }

      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      newTracks.push({
        id: `user_track_${Date.now()}_${index}`,
        title: cleanName,
        artist: 'Offline Local Asset',
        album: 'Sandboxed In-Car Storage',
        duration: 180, // Default duration estimation until loaded
        url,
        isProcedural: false,
        coverColor: colorGradients[index % colorGradients.length],
        fileSize: fileSizeMb,
      });
    });

    if (newTracks.length > 0) {
      onAddTracks(newTracks);
    }
  };

  const filteredTracks = tracks.filter(
    (tr) =>
      tr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-3 md:p-5 text-slate-100">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Rajdhani'] text-white">
              {t.mediaTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {t.mediaSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* File Dropzone & Import Bar */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-amber-400 mb-2">
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-sm font-bold text-white">
          {t.importAudioFiles}
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          {t.dropFilesHere}
        </p>
        <span className="mt-2 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-amber-400">
          Supports MP3, FLAC, WAV, OGG (Zero cloud upload, sandboxed locally)
        </span>
      </div>

      {/* Track List Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani']">
              Packaged Automotive Library ({filteredTracks.length} tracks)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, artist, album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tracks Table / List */}
        <div className="space-y-2">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  isCurrent
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-md ring-1 ring-amber-400/30'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Art Thumbnail */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${track.coverColor} text-white`}>
                    {isCurrent && isPlaying ? (
                      <Disc3 className="h-6 w-6 animate-spin text-amber-300" />
                    ) : (
                      <Music2 className="h-5 w-5" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-400' : 'text-white'}`}>
                        {track.title}
                      </span>
                      {track.isProcedural && (
                        <span className="shrink-0 rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-300 border border-indigo-500/30">
                          PROD SYNTH
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {track.artist} • {track.album}
                    </div>
                  </div>
                </div>

                {/* Right metadata & Play button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden md:inline font-mono text-xs text-slate-400">
                    {track.fileSize}
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Play Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      isCurrent && isPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>

                  {!track.isProcedural && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(track.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Remove imported track"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
