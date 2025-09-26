import React, { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import api from '../services/api';
import { showToast } from '../services/toast';
import { exportToCsv } from '../services/export';

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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files[0].type === 'text/csv' || e.dataTransfer.files[0].name.endsWith('.csv')) {
        setFile(e.dataTransfer.files[0]);
      } else {
        showToast('請上傳有效的 CSV 檔案。', 'error');
      }
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        if (e.target.files[0].type === 'text/csv' || e.target.files[0].name.endsWith('.csv')) {
            setFile(e.target.files[0]);
        } else {
            showToast('請上傳有效的 CSV 檔案。', 'error');
        }
    }
  };

  const handleDownloadTemplate = () => {
    exportToCsv({
      filename: templateFilename,
      headers: templateHeaders,
      data: [], // Export only headers
    });
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      // In a real app, you'd use FormData to send the file
      // const formData = new FormData();
      // formData.append('file', file);
      // await api.post(importEndpoint, formData);
      
      const { data } = await api.post<{message: string}>(importEndpoint, { filename: file.name });
      showToast(data.message || `${itemName} 已成功匯入。`, 'success');
      onImportSuccess();
      handleClose();
    } catch (err: any) {
      const message = err.message || `無法匯入 ${itemName}。請檢查檔案格式並再試一次。`;
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setFile(null);
      setIsLoading(false);
      setIsDragging(false);
      onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`從 CSV 匯入${itemName}`}
      width="w-1/2 max-w-2xl"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
            取消
          </button>
          <button onClick={handleImport} disabled={!file || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isLoading ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="upload-cloud" className="w-4 h-4 mr-2" />}
            {isLoading ? '匯入中...' : '開始匯入'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-sky-900/30 border border-sky-700/50 text-sky-300 flex items-start">
            <Icon name="info" className="w-5 h-5 mr-3 text-sky-400 shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold">操作說明</p>
                <ol className="list-decimal list-inside text-sm mt-1">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); }} className="font-semibold text-sky-400 hover:underline">下載 CSV 範本檔案</a>。</li>
                    <li>根據範本格式填寫您的資料。</li>
                    <li>將填寫好的 CSV 檔案拖曳至下方區域或點擊上傳。</li>
                </ol>
            </div>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? 'border-sky-400 bg-sky-900/30' : 'border-slate-600 hover:border-slate-500'}`}
        >
          <Icon name="upload-cloud" className="w-12 h-12 mx-auto text-slate-400" />
          <p className="mt-2 text-slate-300">拖曳 CSV 檔案至此</p>
          <p className="text-sm text-slate-500">或</p>
          <label className="text-sky-400 font-semibold cursor-pointer hover:underline">
            點擊此處上傳
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
        </div>
        
        {file && (
            <div className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                    <Icon name="file-text" className="w-5 h-5 mr-3 text-slate-300" />
                    <div>
                        <p className="font-semibold text-white">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button onClick={() => setFile(null)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10">
                    <Icon name="x" className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportFromCsvModal;
