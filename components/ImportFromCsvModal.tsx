import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import api, { isApiError } from '../services/api';
import { showToast } from '../services/toast';
import { exportToCsv } from '../services/export';
import { useContentSection } from '../contexts/ContentContext';
import { useDesignSystemClasses } from '../hooks/useDesignSystemClasses';

interface ImportResponseSummary {
  imported?: number;
  failed?: number;
}

interface ImportResponse {
  summary?: ImportResponseSummary;
  message?: string;
}

interface ImportFromCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  importEndpoint: string;
  templateHeaders: string[];
  templateFilename: string;
  itemName: string;
}

const ImportFromCsvModal: React.FC<ImportFromCsvModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  importEndpoint,
  templateHeaders,
  templateFilename,
  itemName,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const modalContent = useContentSection('IMPORT_MODAL');
  const globalContent = useContentSection('GLOBAL');
  const design = useDesignSystemClasses();
  const instructions = modalContent?.INSTRUCTIONS_STEPS ?? [];
  const [downloadInstruction, ...otherInstructions] = instructions;
  const additionalSteps = otherInstructions.length > 0 ? otherInstructions : instructions.slice(1);

  const formatFileSize = (sizeInBytes: number) => {
    const sizeInKb = (sizeInBytes / 1024).toFixed(2);
    if (modalContent?.FILE_SIZE_TEMPLATE?.includes('{size}')) {
      return modalContent.FILE_SIZE_TEMPLATE.replace('{size}', sizeInKb);
    }
    return `${sizeInKb} KB`;
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        showToast(modalContent?.INVALID_FILE_ERROR || 'Please upload a valid CSV file.', 'error');
      }
      event.dataTransfer.clearData();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        showToast(modalContent?.INVALID_FILE_ERROR || 'Please upload a valid CSV file.', 'error');
      }
    }
  };

  const handleDownloadTemplate = () => {
    exportToCsv({
      filename: templateFilename,
      headers: templateHeaders,
      data: [],
    });
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post<ImportResponse>(importEndpoint, { filename: file.name });
      let successMessage =
        modalContent?.IMPORT_SUCCESS_TEMPLATE?.replace('{itemName}', itemName) || `${itemName} imported successfully.`;
      if (data?.summary) {
        const imported = data.summary.imported ?? 0;
        const failed = data.summary.failed ?? 0;
        if (modalContent?.SUMMARY_TEMPLATE) {
          successMessage = modalContent.SUMMARY_TEMPLATE
            .replace('{itemName}', itemName)
            .replace('{successCount}', String(imported))
            .replace('{failCount}', String(failed));
        } else {
          successMessage = `${itemName} imported: ${imported} succeeded, ${failed} failed.`;
        }
      } else if (typeof data?.message === 'string') {
        successMessage = data.message;
      }
      showToast(successMessage, 'success');
      onImportSuccess();
      handleClose();
    } catch (error: unknown) {
      const defaultError =
        modalContent?.IMPORT_ERROR_TEMPLATE?.replace('{itemName}', itemName) ||
        `Could not import ${itemName}. Check the file and try again.`;
      let message = defaultError;
      if (isApiError(error)) {
        message = error.message || defaultError;
        if (typeof error.details === 'object' && error.details !== null && 'message' in error.details) {
          const detailMessage = (error.details as { message?: string }).message;
          if (typeof detailMessage === 'string' && detailMessage.trim()) {
            message = detailMessage;
          }
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setIsLoading(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalContent?.TITLE_TEMPLATE?.replace('{itemName}', itemName) || `Import ${itemName} from CSV`}
      width="w-1/2 max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={handleClose} className={design.button.secondary}>
            {globalContent?.CANCEL || 'Cancel'}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className={`${design.button.primary} inline-flex items-center gap-2`}
          >
            {isLoading ? (
              <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon name="upload-cloud" className="h-4 w-4" />
            )}
            {isLoading ? modalContent?.IMPORTING || 'Importing...' : modalContent?.START_IMPORT || 'Start import'}
          </button>
        </div>
      }
    >
      {modalContent ? (
        <div className="space-y-4">
          <div className="app-surface app-surface--inset app-surface--padded space-y-2">
            <div className="flex items-start gap-3">
              <Icon name="info" className={`h-5 w-5 shrink-0 ${design.text.info}`} />
              <div className="space-y-1">
                <p className={`text-sm font-semibold ${design.text.emphasis}`}>
                  {modalContent.INSTRUCTIONS_TITLE || 'How it works'}
                </p>
                <ol className={`list-inside list-decimal space-y-1 text-sm ${design.text.secondary}`}>
                  <li>
                    <button type="button" onClick={handleDownloadTemplate} className={`underline-offset-4 hover:underline ${design.text.emphasis}`}>
                      {modalContent.DOWNLOAD_LINK || downloadInstruction || 'Download the CSV template'}
                    </button>
                  </li>
                  {additionalSteps.map((step, index) => (
                    <li key={`${step}-${index + 1}`}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div
            className={`app-dropzone ${isDragging ? 'app-dropzone--active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Icon name="upload-cloud" className="app-dropzone__icon" />
            <p className={`text-base font-semibold ${design.text.emphasis}`}>
              {modalContent.DRAG_TEXT || 'Drag your CSV file here'}
            </p>
            <p className={`text-sm ${design.text.secondary}`}>
              {modalContent.OR || 'or'}{' '}
              <button type="button" className="underline" onClick={() => fileInputRef.current?.click()}>
                {modalContent.CLICK_TO_UPLOAD || 'Click to upload'}
              </button>
            </p>
            <p className={`text-xs ${design.text.muted}`}>
              {file ? `${file.name} (${formatFileSize(file.size)})` : modalContent.FILE_SIZE_TEMPLATE?.replace('{size}', '0')}
            </p>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>

          {file && (
            <div className="app-surface app-surface--inset app-surface--padded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="file-text" className={`h-5 w-5 ${design.text.info}`} />
                <div>
                  <p className={`text-sm font-semibold ${design.text.emphasis}`}>{file.name}</p>
                  <p className={`text-xs ${design.text.secondary}`}>{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setFile(null)} className="app-icon-btn app-icon-btn--ghost">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <Icon name="loader-circle" className="h-8 w-8 animate-spin" />
        </div>
      )}
    </Modal>
  );
};

export default ImportFromCsvModal;
