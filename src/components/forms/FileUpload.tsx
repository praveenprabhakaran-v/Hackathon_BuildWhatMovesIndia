import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { SupportingDocument } from '../../types/rti';

interface FileUploadProps {
  id: string;
  onFileSelect: (file: SupportingDocument) => void;
  onFileRemove?: (fileId: string) => void;
  existingFile?: SupportingDocument | null;
  maxSizeKb?: number; // default 1024 (1MB)
  error?: string;
  accept?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  onFileSelect,
  onFileRemove,
  existingFile,
  maxSizeKb = 1024,
  error: externalError,
  accept = '.pdf,application/pdf',
  label = 'Supporting PDF Document',
  required = false,
  helperText,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = externalError || internalError;
  const errorId = `${id}-error`;
  const infoId = `${id}-info`;

  const handleFile = (file: File) => {
    setInternalError(null);

    // Validate type (must be PDF)
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setInternalError('Only PDF format (.pdf) documents are accepted under RTI submission rules.');
      return;
    }

    // Validate size (<= 1MB)
    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > maxSizeKb) {
      setInternalError(`File size (${sizeKb} KB) exceeds the maximum allowed limit of ${maxSizeKb} KB (1 MB). Please compress the PDF.`);
      return;
    }

    const doc: SupportingDocument = {
      fileId: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fileName: file.name,
      sizeKb,
      uploadedAt: new Date().toISOString(),
    };

    onFileSelect(doc);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full max-w-[640px] space-y-2 ${className}`}>
      {/* Persistent Visually Rendered Label */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1B1E22]">
          <span>{label}</span>
          {required && (
            <span className="text-[#C23B22] font-bold ml-1" title="Required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperText ? infoId : undefined}
      />

      {/* UPLOADED STATE: File Chip */}
      {existingFile ? (
        <div className="bg-[#EAF6EE] border border-[#BCE2C9] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white text-[#1E7A46] flex items-center justify-center shrink-0 border border-[#BCE2C9]">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#1B1E22] truncate block max-w-xs sm:max-w-md">
                  {existingFile.fileName}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#1E7A46] shrink-0" aria-hidden="true" />
              </div>
              <div className="text-xs text-[#575D65] font-mono-code mt-0.5">
                {existingFile.sizeKb} KB · PDF Document
              </div>
            </div>
          </div>

          {/* Text action buttons (Never icon-only) */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1B4B8F] bg-white border border-[#1B4B8F]/30 hover:bg-[#EEF3FA] rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Replace File</span>
            </button>
            {onFileRemove && (
              <button
                type="button"
                onClick={() => onFileRemove(existingFile.fileId)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#C23B22] bg-white border border-[#C23B22]/30 hover:bg-[#FDEEED] rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY / DROPZONE STATE */
        <div
          id={`${id}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={`Upload PDF file for ${label}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#1B4B8F] bg-[#EEF3FA]/70 scale-[1.01]'
              : error
              ? 'border-2 border-[#C23B22] bg-[#FDEEED]/30'
              : 'border-[#1B4B8F]/40 hover:border-[#1B4B8F] bg-white hover:bg-[#F6F4EF]/50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1B1E22]">
              Upload a PDF document <span className="font-normal text-[#575D65]">or drag and drop here</span>
            </p>
            <p className="text-xs text-[#575D65] font-mono-code">
              PDF only · Maximum 1 MB ({maxSizeKb} KB)
            </p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[#1B4B8F] bg-[#EEF3FA] hover:bg-[#1B4B8F] hover:text-white rounded-md transition-colors"
          >
            <span>Browse Files</span>
          </button>
        </div>
      )}

      {/* Error Announcement with aria-live="assertive" */}
      {error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-1.5 text-xs text-[#C23B22] font-semibold pt-1">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p id={infoId} className="text-xs text-[#575D65]">
          {helperText}
        </p>
      )}
    </div>
  );
};

