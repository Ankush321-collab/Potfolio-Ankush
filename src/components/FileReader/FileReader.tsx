import React, { 
  useState, 
  useCallback, 
  useEffect, 
  useRef, 
  memo, 
  useMemo 
} from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  X, 
  Upload, 
  AlertCircle, 
  Check,
  Loader2,
  FileCode,
  Moon,
  Sun
} from 'lucide-react';

// TypeScript Interfaces
export interface FileData {
  content: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  extension: string;
}

export interface ReadOptions {
  accept?: string;
  maxSize?: number; // in bytes
  encoding?: string;
  allowedExtensions?: string[];
}

export interface FileReaderProps {
  onFileLoad?: (data: FileData) => void;
  onError?: (error: Error) => void;
  options?: ReadOptions;
  className?: string;
  enableSyntaxHighlighting?: boolean;
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
}

// Utility Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

const validateFile = (file: File, options: ReadOptions): void => {
  if (options.maxSize && file.size > options.maxSize) {
    throw new Error(`File size exceeds limit of ${formatFileSize(options.maxSize)}`);
  }
  
  const ext = getFileExtension(file.name);
  if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
    throw new Error(`File type .${ext} is not allowed`);
  }
  
  if (options.accept && !file.type.match(options.accept)) {
    throw new Error(`File type ${file.type} is not accepted`);
  }
};

// Custom Hook for File Reading
export const useFileReader = (options: ReadOptions = {}) => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const readFile = useCallback(async (file: File): Promise<void> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      validateFile(file, options);
      
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress((event.loaded / event.total) * 100);
          }
        };
        
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      const data: FileData = {
        content,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        extension: getFileExtension(file.name)
      };

      setFileData(data);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const clearFile = useCallback(() => {
    setFileData(null);
    setError(null);
    setProgress(0);
  }, []);

  return { fileData, loading, error, progress, readFile, clearFile };
};

// Virtualized Code Block Component with Syntax Highlighting
const CodeBlock: React.FC<{ content: string; language: string; darkMode: boolean }> = memo(({ 
  content, 
  darkMode 
}) => {
  const lines = content.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Simple virtualization for large files
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const lineHeight = 24;
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const start = Math.floor(scrollTop / lineHeight);
      const end = Math.min(start + 50, lines.length);
      setVisibleRange({ start: Math.max(0, start - 5), end });
    };
    
    const container = containerRef.current;
    if (container && lines.length > 100) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [lines.length]);
  
  const displayLines = lines.length > 100 
    ? lines.slice(visibleRange.start, visibleRange.end)
    : lines;
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto max-h-[60vh] rounded-lg scrollbar-thin ${
        darkMode ? 'bg-slate-900 scrollbar-thumb-slate-700' : 'bg-gray-50 scrollbar-thumb-gray-300'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 backdrop-blur-md bg-opacity-90">
        <span className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {lines.length} lines
        </span>
      </div>
      <div className="p-4 font-mono text-sm" style={{ minHeight: lines.length * lineHeight }}>
        {displayLines.map((line, i) => {
          const actualLineNumber = visibleRange.start + i;
          return (
            <div 
              key={actualLineNumber} 
              className="flex hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
              style={{ height: lineHeight }}
            >
              <span className={`select-none w-12 text-right mr-4 text-xs pt-0.5 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {actualLineNumber + 1}
              </span>
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} break-all`}>
                {line || '\u00A0'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

// Main FileReader Component
export const FileReader: React.FC<FileReaderProps> = memo(({
  onFileLoad,
  onError,
  options = {},
  className = '',
  enableSyntaxHighlighting = true,
  darkMode: controlledDarkMode,
  onDarkModeToggle
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const darkMode = controlledDarkMode ?? internalDarkMode;
  
  const { fileData, loading, error, progress, readFile, clearFile } = useFileReader(options);

  // Dark mode detection
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setInternalDarkMode(true);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    if (onDarkModeToggle) {
      onDarkModeToggle();
    } else {
      setInternalDarkMode(newMode);
    }
  }, [darkMode, onDarkModeToggle]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      try {
        await readFile(files[0]);
        if (onFileLoad && fileData) onFileLoad(fileData);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    }
  }, [readFile, onFileLoad, onError, fileData]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await readFile(files[0]);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    }
  }, [readFile, onError]);

  const handleCopy = useCallback(async () => {
    if (fileData?.content) {
      try {
        await navigator.clipboard.writeText(fileData.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [fileData]);

  const handleDownload = useCallback(() => {
    if (!fileData) return;
    
    const blob = new Blob([fileData.content], { type: fileData.type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fileData]);

  const containerClasses = useMemo(() => {
    return `
      relative w-full max-w-4xl mx-auto rounded-2xl transition-all duration-500
      ${darkMode ? 'bg-slate-800/90 text-white' : 'bg-white/90 text-gray-900'}
      backdrop-blur-xl border border-white/20 shadow-2xl
      ${isDragOver ? 'scale-[1.02] border-blue-500 ring-4 ring-blue-500/20' : ''}
      ${className}
    `;
  }, [darkMode, isDragOver, className]);

  return (
    <div 
      className={containerClasses} 
      role="region" 
      aria-label="File reader"
    >
      {/* Glassmorphism Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-gray-700/30 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileCode className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Reader
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
