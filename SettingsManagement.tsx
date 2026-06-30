import React, { useState, useEffect } from 'react';
import { DiagnosticTest, StaffMember, StaffTransaction, DailyExpense, GlobalSettings, BillingInvoice, IndoorAdmission, STAFF_ROLES } from '../types';
import { 
  Settings, 
  Tag, 
  Users, 
  TrendingDown, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Printer, 
  DollarSign, 
  Search, 
  Calendar, 
  Save, 
  HelpCircle,
  FileDown
} from 'lucide-react';

interface SettingsManagementProps {
  // Existing data for report calculations
  invoices: BillingInvoice[];
  admissions: IndoorAdmission[];
  
  // Tests & Rates
  diagnosticTests: { name: string; cost: number; category: string }[];
  onUpdateTests: (updatedTests: { name: string; cost: number; category: string }[]) => void;
  
  // Global Settings state
  globalSettings: GlobalSettings;
  onUpdateSettings: (settings: GlobalSettings) => void;

  // Staff States
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  transactions: StaffTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<StaffTransaction[]>>;
}

// Initial default categories
const DEFAULT_CATEGORIES = [
  'HAEMATOLOGY (রক্ত রোগ তত্ত্ব)',
  'HORMONE PANNEL (হরমোন প্যানেল)',
  'SEROLOGY (সেরোলজি)',
  'BIO CHEMICAL ANALYSIS (বায়োকেমিক্যাল)',
  'X-RAY DIGITAL (এক্স-রে ডিজিটাল)',
  'URINE EXAM (ইউরিন পরীক্ষা)',
  'STOOL EXAM (মল পরীক্ষা)',
  'ULTRASOUND IMAGING (ইউএসজি)',
  'OTHER'
];

export default function SettingsManagement({
  invoices,
  admissions,
  diagnosticTests,
  onUpdateTests,
  globalSettings,
  onUpdateSettings,
  staff,
  setStaff,
  transactions,
  setTransactions
}: SettingsManagementProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'tests' | 'staff' | 'expenses' | 'reports'>('general');

  // --- GENERAL SETTINGS TAB STATES ---
  const [instName, setInstName] = useState(globalSettings.institutionName);
  const [engName, setEngName] = useState(globalSettings.englishName);
  const [phone, setPhone] = useState(globalSettings.phone);
  const [address, setAddress] = useState(globalSettings.address);
  const [selectedFont, setSelectedFont] = useState(globalSettings.selectedFont);
  const [fontSize, setFontSize] = useState(globalSettings.fontSizeMultiplier);
  const [admFee, setAdmFee] = useState(globalSettings.defaultAdmissionFee);
  const [docFee, setDocFee] = useState(globalSettings.defaultDoctorFee);

  // --- DYNAMIC TESTS STATES ---
  const [testSearch, setTestSearch] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestCost, setNewTestCost] = useState<number | ''>('');
  const [newTestCategory, setNewTestCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [editingTestIndex, setEditingTestIndex] = useState<number | null>(null);
  const [editingTestCost, setEditingTestCost] = useState<number>(0);

  // --- STAFF MANAGEMENT STATES ---
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Staff');
  const [newStaffSalary, setNewStaffSalary] = useState<number | ''>('');

  const [activeStaffForPay, setActiveStaffForPay] = useState<StaffMember | null>(null);
  const [paymentType, setPaymentType] = useState<'Salary' | 'Advance' | 'DueAdjustment'>('Salary');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  // --- DAILY EXPENSES STATES ---
  const [expenses, setExpenses] = useState<DailyExpense[]>(() => {
    const saved = localStorage.getItem('hms_expenses_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Diagnostic Material');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  // --- REPORT STATES ---
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [manualHospitalIncome, setManualHospitalIncome] = useState<number | ''>('');
  const [manualHospitalIncomes, setManualHospitalIncomes] = useState<{[key: string]: number}>(() => {
    const saved = localStorage.getItem('hms_manual_hospital_incomes');
    return saved ? JSON.parse(saved) : {};
  });

  const [activePrintReport, setActivePrintReport] = useState<any>(null);

  // LocalStorage Persistences
  useEffect(() => {
    localStorage.setItem('hms_staff_list', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('hms_staff_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hms_expenses_list', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('hms_manual_hospital_incomes', JSON.stringify(manualHospitalIncomes));
  }, [manualHospitalIncomes]);

  // Sync state if global props change
  useEffect(() => {
    setInstName(globalSettings.institutionName);
    setEngName(globalSettings.englishName);
    setPhone(globalSettings.phone);
    setAddress(globalSettings.address);
    setSelectedFont(globalSettings.selectedFont);
    setFontSize(globalSettings.fontSizeMultiplier);
    setAdmFee(globalSettings.defaultAdmissionFee);
    setDocFee(globalSettings.defaultDoctorFee);
  }, [globalSettings]);

  // General Settings save
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      institutionName: instName.trim(),
      englishName: engName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      selectedFont,
      fontSizeMultiplier: fontSize,
      defaultAdmissionFee: Number(admFee) || 0,
      defaultDoctorFee: Number(docFee) || 0
    });
    alert('জেনারেল সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  // Add Dynamic Test
  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestCost) {
      alert('অনুগ্রহ করে টেস্টের নাম এবং মূল্য লিখুন।');
      return;
    }
    const finalCategory = newTestCategory === 'OTHER' && customCategory.trim() 
      ? customCategory.trim() 
      : newTestCategory;

    // Check if test name already exists
    if (diagnosticTests.some(t => t.name.toLowerCase() === newTestName.trim().toLowerCase())) {
      alert('এই টেস্টটি ইতিমধ্যেই তালিকায় রয়েছে।');
      return;
    }

    const updated = [
      { name: newTestName.trim(), cost: Number(newTestCost), category: finalCategory },
      ...diagnosticTests
    ];
    onUpdateTests(updated);
    setNewTestName('');
    setNewTestCost('');
    setCustomCategory('');
    alert('নতুন ডায়াগনস্টিক টেস্ট সফলভাবে যুক্ত হয়েছে!');
  };

  // Delete dynamic test
  const handleDeleteTest = (nameToDelete: string) => {
    if (confirm(`আপনি কি সত্যিই "${nameToDelete}" টেস্টটি তালিকা থেকে ডিলিট করতে চান?`)) {
      const updated = diagnosticTests.filter(t => t.name !== nameToDelete);
      onUpdateTests(updated);
    }
  };

  // Inline edit test cost
  const handleStartEditTest = (index: number, currentCost: number) => {
    setEditingTestIndex(index);
    setEditingTestCost(currentCost);
  };

  const handleSaveEditTestCost = (index: number) => {
    const updated = [...diagnosticTests];
    updated[index].cost = editingTestCost;
    onUpdateTests(updated);
    setEditingTestIndex(null);
  };

  // Add Staff Member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffSalary) {
      alert('অনুগ্রহ করে স্টাফের নাম এবং মূল বেতন লিখুন।');
      return;
    }
    const newStaff: StaffMember = {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      name: newStaffName.trim(),
      role: newStaffRole,
      salary: Number(newStaffSalary),
      advance: 0,
      due: 0,
      createdAt: new Date().toISOString()
    };
    setStaff(prev => [...prev, newStaff]);
    setNewStaffName('');
    setNewStaffSalary('');
    alert('নতুন কর্মকর্তা/কর্মচারী সফলভাবে যুক্ত করা হয়েছে!');
  };

  // Delete Staff
  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`আপনি কি সত্যিই "${name}" কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      setStaff(prev => prev.filter(s => s.id !== id));
      setTransactions(prev => prev.filter(t => t.staffId !== id));
    }
  };

  // Log Staff transaction (Salary, Advance, Dues payment)
  const handleLogStaffTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaffForPay || !paymentAmount) return;

    const amount = Number(paymentAmount);
    const transId = Math.random().toString(36).substring(2, 11).toUpperCase();
    const newTrans: StaffTransaction = {
      id: transId,
      staffId: activeStaffForPay.id,
      staffName: activeStaffForPay.name,
      type: paymentType,
      amount,
      date: new Date().toISOString().split('T')[0],
      note: paymentNote.trim() || 'N/A'
    };

    // Update staff ledger states
    setStaff(prev => prev.map(s => {
      if (s.id === activeStaffForPay.id) {
        let updatedAdvance = s.advance;
        let updatedDue = s.due;

        if (paymentType === 'Advance') {
          updatedAdvance += amount;
        } else if (paymentType === 'Salary') {
          // Normal monthly salary distribution. If they had advance, subtract it, or add to dues if short.
          // For simplicity, let's just keep track of cumulative advance/dues
        } else if (paymentType === 'DueAdjustment') {
          // Adjust outstanding dues/advance
          updatedDue = Math.max(0, updatedDue - amount);
        }

        return {
          ...s,
          advance: updatedAdvance,
          due: updatedDue
        };
      }
      return s;
    }));

    setTransactions(prev => [newTrans, ...prev]);
    setPaymentAmount('');
    setPaymentNote('');
    setActiveStaffForPay(null);
    alert('স্টাফ লেনদেন সফলভাবে এন্ট্রি করা হয়েছে!');
  };

  // Add Daily Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) {
      alert('অনুগ্রহ করে খরচের নাম এবং মোট অংক লিখুন।');
      return;
    }
    const newExpense: DailyExpense = {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      description: expenseDesc.trim()
    };

    setExpenses(prev => [newExpense, ...prev]);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseDesc('');
    alert('দৈনিক খরচ সফলভাবে যুক্ত হয়েছে!');
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    if (confirm('আপনি কি সত্যিই এই খরচের রেকর্ডটি মুছে ফেলতে চান?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // --- REPORT CALCULATIONS ---
  // Filter invoices for selected Month and Year
  const selectedMonthStr = String(reportMonth).padStart(2, '0');
  const filterPrefix = `${reportYear}-${selectedMonthStr}`; // 'YYYY-MM'

  const monthInvoices = invoices.filter(inv => inv.createdAt.startsWith(filterPrefix));
  const monthAdmissions = admissions.filter(adm => adm.createdAt.startsWith(filterPrefix));

  // Calculating Test Frequencies & Diagnostic Revenue
  const testStatsMap: { [key: string]: { count: number; unitCost: number; totalCost: number } } = {};
  let totalDiagnosticIncome = 0;
  let totalDiagnosticSubtotal = 0;

  monthInvoices.forEach(inv => {
    totalDiagnosticIncome += inv.amountPaid; // Actual cash collected
    totalDiagnosticSubtotal += inv.subTotal;
    
    inv.tests.forEach(test => {
      if (testStatsMap[test.name]) {
        testStatsMap[test.name].count += 1;
        testStatsMap[test.name].totalCost += test.cost;
      } else {
        testStatsMap[test.name] = {
          count: 1,
          unitCost: test.cost,
          totalCost: test.cost
        };
      }
    });
  });

  const testStatsArray = Object.keys(testStatsMap).map(name => ({
    name,
    count: testStatsMap[name].count,
    unitCost: testStatsMap[name].unitCost,
    totalCost: testStatsMap[name].totalCost
  })).sort((a, b) => b.count - a.count);

  // Hospital Income logic
  // Calculate based on Admissions (Admission fee) & Doctor fees from Appointments in this month
  const totalAdmissionFees = monthAdmissions.length * globalSettings.defaultAdmissionFee;
  
  // Custom manual entry or automatic
  const reportKey = `${reportYear}-${reportMonth}`;
  const currentSavedManualHospital = manualHospitalIncomes[reportKey] || 0;
  const totalHospitalIncome = totalAdmissionFees + currentSavedManualHospital;

  // Monthly Expenses
  const monthExpenses = expenses.filter(exp => exp.date.startsWith(filterPrefix));
  const totalExpensesAmount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Salaries paid in this month
  const monthSalariesAmount = transactions
    .filter(t => t.date.startsWith(filterPrefix))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = totalExpensesAmount + monthSalariesAmount;
  const totalInflow = totalDiagnosticIncome + totalHospitalIncome;
  const netSurplus = totalInflow - totalOutflow;

  // Save manual hospital income addition
  const handleSaveManualHospitalIncome = () => {
    const amt = Number(manualHospitalIncome) || 0;
    setManualHospitalIncomes(prev => ({
      ...prev,
      [reportKey]: amt
    }));
    setManualHospitalIncome('');
    alert('হসপিটাল অতিরিক্ত আয় সফলভাবে আপডেট করা হয়েছে!');
  };

  // CSV/Excel download system
  const handleDownloadExcel = () => {
    // Generate CSV string representing the entire monthly financial and test count sheet
    let csvContent = '\ufeff'; // UTF-8 BOM for perfect Bengali rendering in Excel
    
    csvContent += `"${globalSettings.institutionName} - মাসিক ডায়াগনস্টিক ও হসপিটাল রিপোর্ট"\n`;
    csvContent += `"রিপোর্ট মাস:","${reportMonth}/${reportYear}"\n\n`;
    
    csvContent += `"১. আর্থিক সারসংক্ষেপ (Financial Summary)"\n`;
    csvContent += `"আয়ের খাত","মোট পরিমাণ (৳)"\n`;
    csvContent += `"ডায়াগনস্টিক মোট ইনকাম (Diagnostic Net Collections)","${totalDiagnosticIncome}"\n`;
    csvContent += `"হসপিটাল মোট ইনকাম (Hospital Collections - Admissions & OPD)","${totalHospitalIncome}"\n`;
    csvContent += `"মোট অর্জিত রাজস্ব (Total Revenue)","${totalInflow}"\n`;
    csvContent += `"দৈনিক খরচ মোট (Daily Expenses)","${totalExpensesAmount}"\n`;
    csvContent += `"স্টাফ বেতন ও অগ্রিম বিতরণ (Salaries & Advances)","${monthSalariesAmount}"\n`;
    csvContent += `"সর্বমোট খরচ (Total Outflow)","${totalOutflow}"\n`;
    csvContent += `"নিট লাভ/লোকসান (Net Surplus)","${netSurplus}"\n\n`;
    
    csvContent += `"২. টেস্ট কাউন্ট বিবরণী (Diagnostic Tests Performed Counts)"\n`;
    csvContent += `"টেস্টের নাম (Diagnostic Test Name)","পরিমাণ (পিস)","একক মূল্য (৳)","মোট টাকা (৳)"\n`;
    
    testStatsArray.forEach(stat => {
      csvContent += `"${stat.name}","${stat.count}","${stat.unitCost}","${stat.totalCost}"\n`;
    });
    
    csvContent += `\n"৩. খরচের ক্যাটাগরি বিবরণী (Detailed Expenses)"\n`;
    csvContent += `"তারিখ","খরচের খাত","ক্যাটাগরি","টাকার পরিমাণ (৳)","বিবরণ"\n`;
    
    monthExpenses.forEach(exp => {
      csvContent += `"${exp.date}","${exp.title}","${exp.category}","${exp.amount}","${exp.description || 'N/A'}"\n`;
    });

    // Create a Blob and trigger trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HMS_Monthly_Report_${reportMonth}_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNamesBangla = [
    '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  return (
    <div className="space-y-6" id="settings-management-wrapper">
      
      {/* Title Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl text-white shadow-xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800">সেটিংস ও কন্ট্রোল প্যানেল (Control Center)</h2>
            <p className="text-xs text-slate-500">টেস্টের রেট, প্রতিষ্ঠানের তথ্য, ফন্ট, স্টাফ বেতন, দৈনিক খরচ ও মাসিক আর্থিক রিপোর্ট পরিচালনা</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'general'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          জেনারেল ও ফন্ট সেটিংস
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          টেস্ট রেট ডিরেক্টরি ({diagnosticTests.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          স্টাফ বেতন, এডভান্স ও বাকি ({staff.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          দৈনিক খরচ হিসাব ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          মাসিক আর্থিক হিসাব ও ডাউনলোড
        </button>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              প্রতিষ্ঠানের পরিচিতি ও ব্রান্ডিং সেটিংস
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">প্রতিষ্ঠানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">প্রতিষ্ঠানের নাম (English) *</label>
                <input
                  type="text"
                  value={engName}
                  onChange={(e) => setEngName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">মোবাইল/হেল্পলাইন নম্বর *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">প্রতিষ্ঠানের ঠিকানা *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 pt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              সফটওয়্যার ফন্ট এবং সাইজ সেটিংস (Typography Control)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">পছন্দের বাংলা ফন্ট ফেস (Font Family)</label>
                <select
                  value={selectedFont}
                  onChange={(e: any) => setSelectedFont(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-amber-500 font-semibold text-slate-800"
                >
                  <option value="Hind Siliguri">Hind Siliguri (সবচেয়ে আধুনিক ও স্পষ্ট বাংলা)</option>
                  <option value="Inter">Inter (স্ট্যান্ডার্ড জ্যামিতিক টেক ফন্ট)</option>
                  <option value="system-ui">System Default (ডিফল্ট সিস্টেম ফন্ট)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">পছন্দের ফন্টটি সিলেক্ট করলে সম্পূর্ণ সফটওয়্যার ও প্রিন্টআউটে সেটি ডাইনামিকালি সেট হয়ে যাবে।</p>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">ফন্ট ডিসপ্লে সাইজ (Font Size Scale)</label>
                <select
                  value={fontSize}
                  onChange={(e: any) => setFontSize(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-amber-500 font-semibold text-slate-800"
                >
                  <option value="Small">ছোট (Small Scale - Compact)</option>
                  <option value="Normal">স্বাভাবিক (Regular Scale - Recommended)</option>
                  <option value="Large">বড় (Large Scale - High Visibility)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">আপনার মনিটরের স্ক্রিন রেজোলিউশন অনুযায়ী ফন্ট বড় বা ছোট করতে পারেন।</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 pt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              অ্যাডমিশন ও ডাক্তার ডিফল্ট ফি (Admission Form Fees)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">ডিফল্ট অ্যাডমিশন ফি (৳ Admission Fee)</label>
                <input
                  type="number"
                  value={admFee}
                  onChange={(e) => setAdmFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold font-mono text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">ডিফল্ট ডাক্তার ভিজিট ফি (৳ Doctor Fee)</label>
                <input
                  type="number"
                  value={docFee}
                  onChange={(e) => setDocFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold font-mono text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                সেটিংস সেভ করুন (Save Configuration)
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TESTS & RATES */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            
            {/* Insertion Form */}
            <form onSubmit={handleAddTest} className="bg-amber-50/20 border border-amber-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">নতুন ডায়াগনস্টিক টেস্ট ও রেট যুক্ত করুন</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">টেস্টের নাম *</label>
                  <input
                    type="text"
                    placeholder="যেমন: Lipid Profile, CBC, Double Test"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white focus:border-amber-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">টেস্টের রেট (টাকা) *</label>
                  <input
                    type="number"
                    placeholder="যেমন: 450"
                    value={newTestCost}
                    onChange={(e) => setNewTestCost(Number(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white focus:border-amber-500 font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ক্যাটাগরি নির্ধারণ করুন *</label>
                  <select
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-amber-500 font-semibold text-slate-800"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {newTestCategory === 'OTHER' && (
                <div className="text-xs max-w-sm">
                  <label className="block font-semibold text-slate-600 mb-1">নতুন ক্যাটাগরির নাম লিখুন</label>
                  <input
                    type="text"
                    placeholder="যেমন: BIOPSY (বায়োপসি)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  নতুন টেস্ট যুক্ত করুন
                </button>
              </div>
            </form>

            {/* Test List Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>ডায়াগনস্টিক টেস্ট রেট ডিরেক্টরি</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono text-[10px]">{diagnosticTests.length} টি আইটেম</span>
                </h4>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="টেস্ট খুঁজুন..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-bold">
                      <th className="px-4 py-3">টেস্টের নাম (Test Name)</th>
                      <th className="px-4 py-3">ক্যাটাগরি</th>
                      <th className="px-4 py-3 text-right">মূল্য (Rate ৳)</th>
                      <th className="px-4 py-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {diagnosticTests
                      .filter(t => t.name.toLowerCase().includes(testSearch.toLowerCase()) || t.category.toLowerCase().includes(testSearch.toLowerCase()))
                      .slice(0, 100) // limit visibility for performance
                      .map((test, index) => (
                        <tr key={test.name} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-900 font-bold">{test.name}</td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">{test.category}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                            {editingTestIndex === index ? (
                              <input
                                type="number"
                                value={editingTestCost}
                                onChange={(e) => setEditingTestCost(Number(e.target.value) || 0)}
                                className="w-20 px-1 py-0.5 border border-amber-400 rounded text-right font-bold focus:outline-none"
                              />
                            ) : (
                              `৳ ${test.cost}`
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {editingTestIndex === index ? (
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditTestCost(index)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="সংরক্ষণ"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditTest(index, test.cost)}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                  title="এডিট মূল্য"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteTest(test.name)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                title="ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF & SALARY */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Add Staff */}
              <div className="space-y-4">
                <form onSubmit={handleAddStaff} className="bg-slate-50 p-4 border border-slate-200/60 rounded-2xl space-y-4 text-xs">
                  <h4 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    নতুন কর্মকর্তা/কর্মচারী নিবন্ধন
                  </h4>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">স্টাফের নাম *</label>
                    <input
                      type="text"
                      placeholder="যেমন: মারুফ হাসান"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">পদবী/দায়িত্ব *</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      {Object.entries(STAFF_ROLES).map(([key, val]) => (
                        <option key={key} value={key}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">মাসিক মূল বেতন (৳ Basic Salary) *</label>
                    <input
                      type="number"
                      placeholder="যেমন: 15000"
                      value={newStaffSalary}
                      onChange={(e) => setNewStaffSalary(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-bold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    স্টাফ রেজিস্টার করুন
                  </button>
                </form>

                {/* Record Advance / Payment Form */}
                {activeStaffForPay && (
                  <form onSubmit={handleLogStaffTransaction} className="bg-amber-50/30 border border-amber-200/60 p-4 rounded-2xl space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <span className="font-bold text-amber-900">লেনদেন এন্ট্রি: {activeStaffForPay.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setActiveStaffForPay(null)} 
                        className="text-slate-400 hover:text-slate-600 font-bold"
                      >
                        বাতিল
                      </button>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">লেনদেনের ধরণ *</label>
                      <div className="flex gap-2">
                        {(['Salary', 'Advance', 'DueAdjustment'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPaymentType(type)}
                            className={`flex-1 py-1.5 border text-center font-bold rounded-lg transition-all cursor-pointer ${
                              paymentType === type
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {type === 'Salary' ? 'বেতন (Salary)' : type === 'Advance' ? 'এডভান্স' : 'বাকি সমন্বয়'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">টাকার পরিমাণ (৳) *</label>
                      <input
                        type="number"
                        placeholder="৳ পরিমাণ"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value) || '')}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">সংক্ষিপ্ত নোট</label>
                      <input
                        type="text"
                        placeholder="যেমন: জুন মাসের বেতন, বা অগ্রিম রিসিভ"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm transition-all cursor-pointer"
                    >
                      লেনদেনটি সেভ করুন
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Staff Directory */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-slate-700">কর্মকর্তা/কর্মচারী ডিরেক্টরি ও ব্যালেন্স</h4>
                
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-bold">
                        <th className="px-3 py-3">নাম</th>
                        <th className="px-3 py-3">পদবী</th>
                        <th className="px-3 py-3 text-right">মূল বেতন (৳)</th>
                        <th className="px-3 py-3 text-right">অগ্রিম/এডভান্স (৳)</th>
                        <th className="px-3 py-3 text-right">বাকি/অনাদায়ী (৳)</th>
                        <th className="px-3 py-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {staff.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">কোনো কর্মকর্তা/কর্মচারী নিবন্ধিত নেই।</td>
                        </tr>
                      ) : (
                        staff.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/40">
                            <td className="px-3 py-3 font-bold text-slate-900">{s.name}</td>
                            <td className="px-3 py-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {STAFF_ROLES[s.role] || s.role}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-slate-900 font-bold">৳{s.salary}</td>
                            <td className="px-3 py-3 text-right font-mono text-amber-700 font-bold">৳{s.advance}</td>
                            <td className="px-3 py-3 text-right font-mono text-rose-600 font-bold">৳{s.due}</td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setActiveStaffForPay(s)}
                                  className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[10px] font-bold cursor-pointer"
                                  title="লেনদেন এন্ট্রি করুন"
                                >
                                  লেনদেন করুন
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(s.id, s.name)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                                  title="স্টাফ রিমুভ করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Transactions Ledger Log */}
                <h4 className="text-xs font-bold text-slate-700 pt-2 flex items-center gap-1">
                  <span>স্টাফ বেতন ও অগ্রিম প্রদানের লেজার হিস্টোরি</span>
                  <span className="bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded text-[10px]">{transactions.length} টি রেকর্ড</span>
                </h4>

                <div className="overflow-y-auto max-h-48 border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-500 border-collapse">
                    <thead className="bg-slate-50/70 font-bold sticky top-0 border-b">
                      <tr>
                        <th className="px-3 py-2">তারিখ</th>
                        <th className="px-3 py-2">স্টাফের নাম</th>
                        <th className="px-3 py-2">ধরণ</th>
                        <th className="px-3 py-2 text-right">পরিমাণ (৳)</th>
                        <th className="px-3 py-2">নোট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium text-slate-600">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-slate-400">কোনো আর্থিক লেনদেন রেকর্ড করা হয়নি।</td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/20 text-[11px]">
                            <td className="px-3 py-2 font-mono">{t.date}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{t.staffName}</td>
                            <td className="px-3 py-2">
                              {t.type === 'Salary' ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">বেতন প্রদান</span>
                              ) : t.type === 'Advance' ? (
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">এডভান্স</span>
                              ) : (
                                <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">বাকি সমন্বয়</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">৳{t.amount}</td>
                            <td className="px-3 py-2 text-slate-400">{t.note}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DAILY EXPENSES */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add Expense Form */}
              <div className="space-y-4">
                <form onSubmit={handleAddExpense} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4 text-xs">
                  <h4 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    দৈনিক খরচ এন্ট্রি করুন (Expenses)
                  </h4>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">খরচের নাম/বিবরণ *</label>
                    <input
                      type="text"
                      placeholder="যেমন: টেস্ট রিএজেন্ট, বিদ্যুৎ বিল, পেপার রোল"
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">ক্যাটাগরি নির্ধারণ করুন *</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold text-slate-800"
                    >
                      <option value="Diagnostic Material">ডায়াগনস্টিক রিএজেন্ট ও কেমিক্যাল</option>
                      <option value="Hospital Equipment">হাসপাতাল যন্ত্রপাতি/মেরামত</option>
                      <option value="Utility Bills">ইউটিলিটি বিল (বিদ্যুৎ, গ্যাস, ইন্টারনেট)</option>
                      <option value="Office Stationery">অফিস স্টেশনারি ও খাতা-কলম</option>
                      <option value="Entertainment">আপ্যায়ন ও খাবার খরচ</option>
                      <option value="Staff Maintenance">স্টাফ যাতায়াত / বিবিধ খরচ</option>
                      <option value="Other">অন্যান্য সাধারণ খরচ</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">টাকার পরিমাণ *</label>
                      <input
                        type="number"
                        placeholder="যেমন: 500"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(Number(e.target.value) || '')}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">তারিখ *</label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
                    <textarea
                      placeholder="বিস্তারিত বিবরণ এখানে লিখুন..."
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                      rows={2}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    দৈনিক খরচ সেভ করুন
                  </button>
                </form>
              </div>

              {/* Expense List and Search */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-700">দৈনিক খরচের তালিকা ও বিবরণী</h4>
                  
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="খরচ খুঁজুন..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Expenses statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs">
                    <span className="block font-semibold text-rose-800 mb-1">আজকের মোট খরচ</span>
                    <span className="text-lg font-extrabold text-rose-950 font-mono">
                      ৳ {expenses
                        .filter(e => e.date === new Date().toISOString().split('T')[0])
                        .reduce((sum, e) => sum + e.amount, 0)
                      }
                    </span>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100/50 p-3 rounded-xl text-xs">
                    <span className="block font-semibold text-rose-800 mb-1">চলতি মাসের মোট খরচ</span>
                    <span className="text-lg font-extrabold text-rose-950 font-mono">
                      ৳ {expenses
                        .filter(e => e.date.startsWith(new Date().toISOString().substring(0, 7)))
                        .reduce((sum, e) => sum + e.amount, 0)
                      }
                    </span>
                  </div>
                </div>

                {/* Table of expense list */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-bold">
                        <th className="px-3 py-3">তারিখ</th>
                        <th className="px-3 py-3">খরচের খাত</th>
                        <th className="px-3 py-3">ক্যাটাগরি</th>
                        <th className="px-3 py-3 text-right">টাকার পরিমাণ</th>
                        <th className="px-3 py-3 text-center">ডিলিট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-slate-400 font-medium">কোনো খরচের রেকর্ড পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        expenses
                          .filter(e => e.title.toLowerCase().includes(expenseSearch.toLowerCase()) || e.category.toLowerCase().includes(expenseSearch.toLowerCase()))
                          .map((exp) => (
                            <tr key={exp.id} className="hover:bg-slate-50/40">
                              <td className="px-3 py-3 font-mono text-[11px] text-slate-500">{exp.date}</td>
                              <td className="px-3 py-3">
                                <span className="block font-bold text-slate-900">{exp.title}</span>
                                {exp.description && <span className="block text-[10px] text-slate-400 mt-0.5">{exp.description}</span>}
                              </td>
                              <td className="px-3 py-3 text-slate-500 text-[10px]">{exp.category}</td>
                              <td className="px-3 py-3 text-right font-mono font-bold text-rose-600">৳{exp.amount}</td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL REPORTS & EXCEL/PDF DOWNLOAD */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Filter Panel */}
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-wrap items-end gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">রিপোর্ট মাস নির্ধারণ করুন</label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value={1}>জানুয়ারি (01)</option>
                  <option value={2}>ফেব্রুয়ারি (02)</option>
                  <option value={3}>মার্চ (03)</option>
                  <option value={4}>এপ্রিল (04)</option>
                  <option value={5}>মে (05)</option>
                  <option value={6}>জুন (06)</option>
                  <option value={7}>জুলাই (07)</option>
                  <option value={8}>আগস্ট (08)</option>
                  <option value={9}>সেপ্টেম্বর (09)</option>
                  <option value={10}>অক্টোবর (10)</option>
                  <option value={11}>নভেম্বর (11)</option>
                  <option value={12}>ডিসেম্বর (12)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">রিপোর্ট সাল</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold font-mono"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-[11px] text-emerald-800">
                <span className="font-bold block text-[10px] text-emerald-600">হসপিটাল অতিরিক্ত আয় (OPD/Cabin, manually recorded)</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    placeholder="৳ অংক যেমন: 12000"
                    value={manualHospitalIncome}
                    onChange={(e) => setManualHospitalIncome(e.target.value)}
                    className="px-2 py-1 border border-emerald-200 bg-white rounded text-xs focus:outline-none focus:border-emerald-500 w-32 font-bold font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualHospitalIncome}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all cursor-pointer"
                  >
                    সেভ
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  এক্সেল CSV ডাউনলোড
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Open a dynamic print window or print the printable section
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  রিপোর্ট প্রিন্ট করুন / PDF
                </button>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="monthly-financial-grid">
              
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold text-emerald-600 block text-[10px] uppercase tracking-wide">১. ডায়াগনস্টিক মোট কালেকশন</span>
                <span className="text-xl font-black block font-mono text-emerald-950">৳ {totalDiagnosticIncome}</span>
                <p className="text-[10px] text-slate-400">এই মাসের মোট পরিশোধিত বিলের টাকা</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold text-emerald-600 block text-[10px] uppercase tracking-wide">২. হসপিটাল মোট কালেকশন</span>
                <span className="text-xl font-black block font-mono text-emerald-950">৳ {totalHospitalIncome}</span>
                <p className="text-[10px] text-slate-400">অ্যাডমিশন ফি: ৳{totalAdmissionFees} + অতিরিক্ত: ৳{currentSavedManualHospital}</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs text-rose-900 space-y-1">
                <span className="font-bold text-rose-600 block text-[10px] uppercase tracking-wide">৩. মোট আউটফ্লো (খরচ + বেতন)</span>
                <span className="text-xl font-black block font-mono text-rose-950">৳ {totalOutflow}</span>
                <p className="text-[10px] text-slate-400">দৈনিক খরচ: ৳{totalExpensesAmount} + বেতন ও অগ্রিম: ৳{monthSalariesAmount}</p>
              </div>

              <div className={`p-4 rounded-2xl text-xs space-y-1 border ${
                netSurplus >= 0 
                  ? 'bg-sky-50 border-sky-100 text-sky-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <span className="font-bold block text-[10px] uppercase tracking-wide">৪. নিট লাভ/লোকসান (Surplus)</span>
                <span className="text-xl font-black block font-mono">৳ {netSurplus}</span>
                <p className="text-[10px] text-slate-400">মোট রাজস্ব ৳{totalInflow} বিয়োগ মোট খরচ</p>
              </div>

            </div>

            {/* Split layout: Test count stats and expenses details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="report-details-layout">
              
              {/* Test statistics lists */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between border-b pb-2">
                  <span>টেস্ট সম্পন্ন হওয়ার সংখ্যা (Diagnostic Tests Performed counts)</span>
                  <span className="text-amber-600 font-mono text-[10px]">{testStatsArray.length} টি ভিন্ন টেস্ট</span>
                </h4>

                <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[400px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 font-bold sticky top-0 border-b">
                      <tr className="text-slate-500 uppercase">
                        <th className="px-3 py-2.5">টেস্টের নাম</th>
                        <th className="px-3 py-2.5 text-center">পরিমাণ (পিস)</th>
                        <th className="px-3 py-2.5 text-right">একক মূল্য</th>
                        <th className="px-3 py-2.5 text-right">মোট টাকা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {testStatsArray.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-400">এই মাসে কোনো টেস্ট সম্পাদন করা হয়নি।</td>
                        </tr>
                      ) : (
                        testStatsArray.map((stat) => (
                          <tr key={stat.name} className="hover:bg-slate-50/20 text-[11px]">
                            <td className="px-3 py-2 text-slate-900 font-bold">{stat.name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono">
                                {stat.count} পিস
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">৳{stat.unitCost}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">৳{stat.totalCost}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expense breakdown list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between border-b pb-2">
                  <span>এই মাসের খরচ ও বেতন বিতরণ খতিয়ান</span>
                  <span className="text-rose-600 font-mono text-[10px]">মোট: ৳{totalOutflow}</span>
                </h4>

                <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[400px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 font-bold sticky top-0 border-b">
                      <tr className="text-slate-500 uppercase">
                        <th className="px-3 py-2.5">তারিখ</th>
                        <th className="px-3 py-2.5">বিবরণ / খাত</th>
                        <th className="px-3 py-2.5">ক্যাটাগরি</th>
                        <th className="px-3 py-2.5 text-right">পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {/* Salaries in this month */}
                      {transactions
                        .filter(t => t.date.startsWith(filterPrefix))
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-rose-50/10 text-[11px] bg-amber-50/10">
                            <td className="px-3 py-2 font-mono text-slate-500">{t.date}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">বেতন/এডভান্স: {t.staffName}</td>
                            <td className="px-3 py-2">
                              <span className="text-amber-800 bg-amber-100/50 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {t.type === 'Salary' ? 'কর্মচারী বেতন' : t.type === 'Advance' ? 'স্টাফ এডভান্স' : 'বাকি সমন্বয়'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-rose-600">৳{t.amount}</td>
                          </tr>
                        ))}

                      {/* Daily expenses in this month */}
                      {monthExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/20 text-[11px]">
                          <td className="px-3 py-2 font-mono text-slate-500">{exp.date}</td>
                          <td className="px-3 py-2">
                            <span className="block font-bold text-slate-800">{exp.title}</span>
                            {exp.description && <span className="block text-[9px] text-slate-400">{exp.description}</span>}
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[10px]">{exp.category}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-rose-600">৳{exp.amount}</td>
                        </tr>
                      ))}

                      {monthExpenses.length === 0 && transactions.filter(t => t.date.startsWith(filterPrefix)).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-400">এই মাসে কোনো খরচ বা বেতন এন্ট্রি রেকর্ড করা হয়নি।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* --- HIDDEN PRINT AREA FOR THE MONTHLY REPORT PDF --- */}
      <div id="print-token-slip" className="hidden print:block p-8 space-y-6 text-slate-800 font-sans" style={{ fontFamily: globalSettings.selectedFont === 'system-ui' ? 'sans-serif' : globalSettings.selectedFont }}>
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-black">{globalSettings.institutionName}</h1>
          <h2 className="text-xs font-mono tracking-wider text-slate-500 font-bold uppercase mt-0.5">{globalSettings.englishName}</h2>
          <p className="text-xs font-semibold mt-1">{globalSettings.address} | মোবাইল: {globalSettings.phone}</p>
          <div className="inline-block mt-3 px-4 py-1 bg-slate-100 text-slate-800 border rounded-full font-bold text-xs uppercase tracking-wide">
            মাসিক আয় ও ব্যয় প্রতিবেদন (Monthly Audit Report)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold">
          <p><span className="text-slate-500">প্রতিবেদন মাস:</span> <span className="font-bold text-slate-900">{monthNamesBangla[reportMonth]} - {reportYear}</span></p>
          <p className="text-right"><span className="text-slate-500">প্রিন্ট করার তারিখ:</span> <span className="font-mono">{new Date().toLocaleDateString('bn-BD')}</span></p>
        </div>

        <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
          <h3 className="font-bold text-slate-800 border-b pb-1.5 uppercase text-[11px] tracking-wider">১. আর্থিক লেনদেন খতিয়ান (Financial Ledger)</h3>
          <div className="grid grid-cols-2 gap-y-2 font-semibold">
            <p className="text-slate-600">ক) ডায়াগনস্টিক মোট নগদ কালেকশন:</p>
            <p className="text-right font-mono font-bold text-slate-950">৳ {totalDiagnosticIncome}</p>

            <p className="text-slate-600">খ) হসপিটাল মোট কালেকশন (অ্যাডমিশন + ওপিডি):</p>
            <p className="text-right font-mono font-bold text-slate-950">৳ {totalHospitalIncome}</p>

            <p className="text-slate-600 border-t pt-1.5 font-bold">সর্বমোট রাজস্ব ইনকাম (Total Inflow):</p>
            <p className="text-right border-t pt-1.5 font-mono font-black text-slate-950">৳ {totalInflow}</p>

            <p className="text-slate-600 pt-1">গ) দৈনিক খরচ সমূহ (Daily Outflow):</p>
            <p className="text-right pt-1 font-mono font-bold text-rose-600">৳ {totalExpensesAmount}</p>

            <p className="text-slate-600">ঘ) কর্মচারীদের মোট পরিশোধিত বেতন ও অগ্রিম:</p>
            <p className="text-right font-mono font-bold text-rose-600">৳ {monthSalariesAmount}</p>

            <p className="text-slate-600 border-t pt-1.5 font-bold">সর্বমোট আউটফ্লো খরচ (Total Outflow):</p>
            <p className="text-right border-t pt-1.5 font-mono font-black text-rose-900">৳ {totalOutflow}</p>

            <p className="text-slate-900 border-t pt-2 font-extrabold text-[13px] bg-slate-100 p-1 rounded">ঙ) নিট উদ্বৃত্ত মুনাফা (Net Profit Surplus):</p>
            <p className="text-right border-t pt-2 font-mono font-black text-[13px] text-emerald-800 bg-slate-100 p-1 rounded">৳ {netSurplus}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 border-b pb-1.5 text-xs uppercase tracking-wide">২. ডায়াগনস্টিক টেস্ট সম্পাদন বিবরণী (Test Counts Statistics)</h3>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold border-b text-slate-700">
                <th className="px-2 py-1.5">টেস্টের নাম</th>
                <th className="px-2 py-1.5 text-center">পরিমাণ (পিস)</th>
                <th className="px-2 py-1.5 text-right">একক রেট (৳)</th>
                <th className="px-2 py-1.5 text-right">মোট টাকা (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium text-slate-800">
              {testStatsArray.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">কোনো টেস্ট রেকর্ড নেই।</td>
                </tr>
              ) : (
                testStatsArray.map(stat => (
                  <tr key={stat.name}>
                    <td className="px-2 py-1.5 font-bold">{stat.name}</td>
                    <td className="px-2 py-1.5 text-center font-bold">{stat.count} পিস</td>
                    <td className="px-2 py-1.5 text-right font-mono">৳{stat.unitCost}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold">৳{stat.totalCost}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-16 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-700">
          <div>
            <div className="border-t border-slate-300 pt-1">প্রস্তুতকারী (Biller/BUM)</div>
          </div>
          <div>
            <div className="border-t border-slate-300 pt-1">অ্যাকাউন্ট্যান্ট (Accountant)</div>
          </div>
          <div>
            <div className="border-t border-slate-300 pt-1">ব্যবস্থাপনা পরিচালক (Director)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
