import React, { useState, useEffect, useCallback } from 'react';
import FormRow from '../../components/FormRow';
import Icon from '../../components/Icon';
import PlaceholderModal from '../../components/PlaceholderModal';
import api from '../../services/api';
import { LoginHistoryRecord } from '../../types';
import Pagination from '../../components/Pagination';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';

const SecuritySettingsPage: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const fetchLoginHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ items: LoginHistoryRecord[], total: number }>('/me/login-history', {
                params: { page: currentPage, page_size: pageSize }
            });
            setLoginHistory(data.items);
            setTotal(data.total);
        } catch (err) {
            setError("無法獲取登入歷史。");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);
    
    useEffect(() => {
        fetchLoginHistory();
    }, [fetchLoginHistory]);

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const handlePasswordChange = () => {
        showPlaceholderModal('變更密碼');
    };

    return (
        <div className="max-w-4xl">
            <div className="glass-card rounded-xl p-6">
                {/* Section 1: Change Password */}
                <div>
                    <h2 className="text-xl font-bold mb-4">變更密碼</h2>
                    <div className="space-y-4">
                        <FormRow label="舊密碼">
                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="新密碼">
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="確認新密碼">
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                        <button onClick={handlePasswordChange} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">更新密碼</button>
                    </div>
                </div>

                {/* Separator */}
                <div className="my-8 border-b border-slate-700/50"></div>

                {/* Section 2: Login History */}
                <div>
                    <h2 className="text-xl font-bold mb-4">最近登入活動</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                           <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                               <tr>
                                   <th className="px-4 py-2">時間</th>
                                   <th className="px-4 py-2">IP 位址</th>
                                   <th className="px-4 py-2">裝置</th>
                                   <th className="px-4 py-2">狀態</th>
                               </tr>
                           </thead>
                           <tbody>
                               {isLoading ? (
                                    <TableLoader colSpan={4} />
                                ) : error ? (
                                    <TableError colSpan={4} message={error} onRetry={fetchLoginHistory} />
                                ) : loginHistory.map(log => (
                                   <tr key={log.id} className="border-b border-slate-800 last:border-b-0">
                                       <td className="px-4 py-3">{log.timestamp}</td>
                                       <td className="px-4 py-3">{log.ip}</td>
                                       <td className="px-4 py-3">{log.device}</td>
                                       <td className={`px-4 py-3 font-semibold ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                           {log.status.toUpperCase()}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                    <Pagination total={total} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
                </div>
            </div>
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default SecuritySettingsPage;