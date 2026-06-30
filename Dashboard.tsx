import React from 'react';
import { Patient, Appointment, BillingInvoice } from '../types';
import { Users, Calendar, Activity, DollarSign, Clock, CheckCircle2, AlertCircle, Database, Download, Upload } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  invoices: BillingInvoice[];
  onSelectTab: (tab: string) => void;
  onRestoreData: (backup: any) => void;
}

export default function Dashboard({ patients, appointments, invoices, onSelectTab, onRestoreData }: DashboardProps) {
  // 1. Calculate Statistics
  const totalPatients = patients.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => app.date === todayStr);
  const pendingAppointments = todayAppointments.filter(app => app.status === 'Pending');
  
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

  // 2. Prepare Revenue Chart Data (Last 6 days)
  const getLast6DaysData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      const dayInvoices = invoices.filter(inv => inv.createdAt.startsWith(dateStr));
      const collected = dayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
      const due = dayInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
      const patientCount = patients.filter(p => p.createdAt.startsWith(dateStr)).length;

      data.push({
        name: dateLabel,
        'Collected Amount (৳)': collected,
        'Due Amount (৳)': due,
        'Patient Count': patientCount,
      });
    }
    return data;
  };

  const chartData = getLast6DaysData();

  // 3. Prepare Test Frequency Data
  const getTestFreqData = () => {
    const testCounts: { [key: string]: number } = {};
    invoices.forEach(inv => {
      inv.tests.forEach(test => {
        testCounts[test.name] = (testCounts[test.name] || 0) + 1;
      });
    });

    const sortedTests = Object.entries(testCounts)
      .map(([name, count]) => ({ name, 'Test Count': count }))
      .sort((a, b) => b['Test Count'] - a['Test Count'])
      .slice(0, 5);

    return sortedTests.length > 0 ? sortedTests : [
      { name: 'CBC', 'Test Count': 0 },
      { name: 'Lipid Profile', 'Test Count': 0 },
      { name: 'USG', 'Test Count': 0 },
      { name: 'ECG', 'Test Count': 0 },
      { name: 'X-Ray', 'Test Count': 0 },
    ];
  };

  const testData = getTestFreqData();

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-stats">
        {/* Card 1: Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Total Registered Patients</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{totalPatients} Patients</h3>
            <button 
              onClick={() => onSelectTab('patients')}
              className="text-[11px] text-emerald-600 hover:underline font-medium block"
            >
              View Patient List →
            </button>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Today's Appointments</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{todayAppointments.length} Appts</h3>
            <p className="text-[11px] text-slate-500">
              Pending: <span className="text-amber-600 font-semibold">{pendingAppointments.length}</span>
            </p>
          </div>
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Collected Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Total Collected Amount</p>
            <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">৳ {totalPaid.toLocaleString('en-US')}</h3>
            <p className="text-[11px] text-slate-500">
              Total Invoiced: ৳{totalInvoiced.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Total Due Balance</p>
            <h3 className="text-2xl font-bold text-rose-600 tracking-tight">৳ {totalDue.toLocaleString('en-US')}</h3>
            <button 
              onClick={() => onSelectTab('billing')}
              className="text-[11px] text-rose-600 hover:underline font-medium block"
            >
              Collect Due Amount →
            </button>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-xl text-rose-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Financial & Patient Flow (Last 6 Days)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Collected Amount (৳)" stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" strokeWidth={2} />
                <Area type="monotone" dataKey="Due Amount (৳)" stroke="#ef4444" fillOpacity={1} fill="url(#colorDue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Popular Diagnostic Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Popular Diagnostic Tests</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="Test Count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              Today's Pending Appointments ({pendingAppointments.length})
            </h4>
            <button
              onClick={() => onSelectTab('appointments')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                There are no pending appointments today.
              </div>
            ) : (
              pendingAppointments.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{app.patientName}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                        Serial #{app.serialNo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{app.doctorName} ({app.specialty})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-600 block">{app.time}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Patients & Billing Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Recently Registered Patients
            </h4>
            <button
              onClick={() => onSelectTab('patients')}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              New Registration
            </button>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {patients.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No patients have been registered yet.
              </div>
            ) : (
              patients.slice(-4).reverse().map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">{p.name}</span>
                      <span className="text-[10px] text-slate-500">({p.age} Yrs, {p.gender === 'Male' ? 'Male' : p.gender === 'Female' ? 'Female' : 'Others'})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Mobile: {p.phone}</p>
                  </div>
                  <button
                    onClick={() => onSelectTab('billing')}
                    className="text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                  >
                    Create Bill
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Database Backup & Recovery Panel */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Data Backup & Recovery Center (Local Backup & Security Center)</h4>
              <p className="text-[11px] text-slate-500">Take backup to protect all your diagnostic center data or recover from previously saved files.</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Secure Local Storage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export section */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                Export Backup File (Export Data)
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Download a JSON data backup file containing all patient, appointment, and bill records to your computer. We suggest exporting your data at least once a week for safety.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const backupObj = {
                  patients,
                  appointments,
                  invoices,
                  prescriptions: JSON.parse(localStorage.getItem('hms_prescriptions') || '[]'),
                  admissions: JSON.parse(localStorage.getItem('hms_admissions') || '[]'),
                  custom_doctors: JSON.parse(localStorage.getItem('custom_doctors') || '[]'),
                  custom_referred_doctors: JSON.parse(localStorage.getItem('custom_referred_doctors') || '[]'),
                  version: '2.0',
                  exportedAt: new Date().toISOString()
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `maruf_diagnostic_backup_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Backup File
            </button>
          </div>

          {/* Import section */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-500" />
                Recover Previous Backup (Import Data)
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Select your previously exported backup file to restore all patients, bills, and prescriptions. This will overwrite current data with the backup file's contents.
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const fileReader = new FileReader();
                  if (e.target.files && e.target.files[0]) {
                    const confirmRestore = window.confirm('Are you sure you want to upload this backup file? This will overwrite all current database records with the backup file data.');
                    if (!confirmRestore) {
                      e.target.value = '';
                      return;
                    }
                    fileReader.readAsText(e.target.files[0], "UTF-8");
                    fileReader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed && typeof parsed === 'object') {
                          onRestoreData(parsed);
                          alert('Congratulations! Your diagnostic data has been recovered successfully.');
                          e.target.value = '';
                        } else {
                          alert('Invalid data file. Please select a valid backup file.');
                        }
                      } catch (err) {
                        alert('Could not read file. Please provide a valid JSON backup file.');
                      }
                    };
                  }
                }}
                className="hidden"
                id="import-backup-file-input"
              />
              <label
                htmlFor="import-backup-file-input"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
              >
                <Upload className="w-4 h-4" /> Upload Backup File
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
