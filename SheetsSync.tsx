import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { SyncStatus } from '../types';
import { googleSignIn, logout, createSpreadsheet } from '../firebase';
import { Database, LogOut, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, Layers } from 'lucide-react';

interface SheetsSyncProps {
  user: User | null;
  token: string | null;
  onLogin: (user: User, token: string) => void;
  onLogout: () => void;
  syncStatus: SyncStatus;
  setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>;
  onSyncAll: () => Promise<void>;
}

export default function SheetsSync({
  user,
  token,
  onLogin,
  onLogout,
  syncStatus,
  setSyncStatus,
  onSyncAll,
}: SheetsSyncProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [customSheetId, setCustomSheetId] = useState('');

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onLogin(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setSyncStatus(prev => ({ ...prev, error: 'Google Sign-in failed.' }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!token) return;
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const title = `Hospital & Diagnostic DB - ${new Date().toLocaleDateString('en-US')}`;
      const sheetInfo = await createSpreadsheet(title, token);
      
      const newStatus: SyncStatus = {
        spreadsheetId: sheetInfo.id,
        spreadsheetUrl: sheetInfo.url,
        lastSynced: new Date().toLocaleString('en-US'),
        isSyncing: false,
        error: null,
      };
      
      setSyncStatus(newStatus);
      // Save to localStorage so it persists across refreshes
      localStorage.setItem('hms_spreadsheet_id', sheetInfo.id);
      localStorage.setItem('hms_spreadsheet_url', sheetInfo.url);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: 'Could not create new spreadsheet.' }));
    }
  };

  const handleLinkCustomSheet = () => {
    if (!customSheetId.trim()) return;
    const url = `https://docs.google.com/spreadsheets/d/${customSheetId.trim()}/edit`;
    const newStatus: SyncStatus = {
      spreadsheetId: customSheetId.trim(),
      spreadsheetUrl: url,
      lastSynced: null,
      isSyncing: false,
      error: null,
    };
    setSyncStatus(newStatus);
    localStorage.setItem('hms_spreadsheet_id', customSheetId.trim());
    localStorage.setItem('hms_spreadsheet_url', url);
    setCustomSheetId('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="sheets-sync-section">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Google Sheets Integration
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Keep all your hospital and diagnostic data secure directly in your Google Cloud Sheets.
          </p>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="text-xs font-semibold text-slate-700">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        ) : null}
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center px-4">
          <Database className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Connect Google Sheets Database</h3>
          <p className="text-slate-500 text-sm max-w-md mt-1 mb-6">
            Sign in with your Google account to enable database synchronization and save all reports directly to your Google Drive.
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm py-2 px-5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <div className="gsi-material-button-content-wrapper flex items-center gap-2">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents text-sm font-semibold">Sign in with Google</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Sheet Connection Status
              </h3>
              
              {syncStatus.spreadsheetId ? (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Database Sheet Connected!
                  </div>
                  <div className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-200 font-mono break-all">
                    Spreadsheet ID: <br />
                    <span className="text-slate-700 font-semibold">{syncStatus.spreadsheetId}</span>
                  </div>
                  {syncStatus.lastSynced && (
                    <p className="text-xs text-slate-500">
                      Last Synced: <span className="font-semibold text-slate-700">{syncStatus.lastSynced}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    No database sheet created or connected.
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Create a new Google Spreadsheet file which will automatically prepare tables (Patients, Appointments, DiagnosticTests, Prescriptions, Admissions, Staff) for your hospital.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {!syncStatus.spreadsheetId ? (
                <button
                  onClick={handleCreateNewSheet}
                  disabled={syncStatus.isSyncing}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  Create New Google Database Sheet
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onSyncAll}
                    disabled={syncStatus.isSyncing}
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    Sync Data
                  </button>
                  
                  <a
                    href={syncStatus.spreadsheetUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Open Sheet
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Manually Link Existing Sheet</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                If you already have a previously created Spreadsheet, you can paste its ID below to link it.
              </p>
              
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-600">Google Spreadsheet ID:</label>
                <input
                  type="text"
                  value={customSheetId}
                  onChange={(e) => setCustomSheetId(e.target.value)}
                  placeholder="Example: 1BxiMVs0XRA5nFMdKv1Sux0DA6SR_16M2G10n6U1V76Y"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleLinkCustomSheet}
              disabled={!customSheetId.trim()}
              className="mt-6 w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Link Custom Sheet
            </button>
          </div>
        </div>
      )}

      {syncStatus.error && (
        <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2 border border-red-100">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{syncStatus.error}</span>
        </div>
      )}
    </div>
  );
}
