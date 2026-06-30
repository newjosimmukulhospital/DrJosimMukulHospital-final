import React, { useState } from 'react';
import { StaffMember, StaffTransaction, STAFF_ROLES } from '../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  FileText, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Briefcase,
  Layers,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface StaffPayrollManagementProps {
  staff: StaffMember[];
  transactions: StaffTransaction[];
  onAddStaff: (newStaff: StaffMember) => void;
  onDeleteStaff: (id: string, name: string) => void;
  onUpdateStaffList: (updated: StaffMember[]) => void;
  onAddTransaction: (newTrans: StaffTransaction) => void;
}

export default function StaffPayrollManagement({
  staff,
  transactions,
  onAddStaff,
  onDeleteStaff,
  onUpdateStaffList,
  onAddTransaction
}: StaffPayrollManagementProps) {
  // UI and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Add Staff Modal/Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Staff');
  const [newStaffSalary, setNewStaffSalary] = useState<number | ''>('');

  // Payment Form state
  const [activeStaffForPay, setActiveStaffForPay] = useState<StaffMember | null>(null);
  const [paymentType, setPaymentType] = useState<'Salary' | 'Advance' | 'DueAdjustment'>('Salary');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  // Voucher print state
  const [activePrintTransaction, setActivePrintTransaction] = useState<StaffTransaction | null>(null);

  // Stats calculation
  const totalMonthlySalaryLiability = staff.reduce((acc, s) => acc + s.salary, 0);
  const totalAdvancesGiven = staff.reduce((acc, s) => acc + (s.advance || 0), 0);
  const totalDuesOutstanding = staff.reduce((acc, s) => acc + (s.due || 0), 0);

  // Add staff handler
  const handleAddNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffSalary) return;

    const newStaff: StaffMember = {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      name: newStaffName.trim(),
      role: newStaffRole,
      salary: Number(newStaffSalary),
      advance: 0,
      due: Number(newStaffSalary), // Default due for the month is their salary
      createdAt: new Date().toISOString()
    };

    onAddStaff(newStaff);
    
    // Clear state
    setNewStaffName('');
    setNewStaffSalary('');
    setNewStaffRole('Staff');
    setIsAddModalOpen(false);
  };

  // Issue payment/transaction handler
  const handleIssuePaymentSubmit = (e: React.FormEvent) => {
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
      note: paymentNote.trim() || (paymentType === 'Salary' ? 'মাসিক বেতন পরিশোধ' : paymentType === 'Advance' ? 'অগ্রিম ঋণ প্রদান' : 'বকেয়া সমন্বয়')
    };

    // Update staff ledger states
    const updatedStaffList = staff.map(s => {
      if (s.id === activeStaffForPay.id) {
        let updatedAdvance = s.advance || 0;
        let updatedDue = s.due || 0;

        if (paymentType === 'Salary') {
          // Paying off their salary due
          updatedDue = Math.max(0, updatedDue - amount);
        } else if (paymentType === 'Advance') {
          // Employee takes advance loan
          updatedAdvance += amount;
        } else if (paymentType === 'DueAdjustment') {
          // Manual adjustments
          updatedDue = Math.max(0, updatedDue - amount);
        }

        return {
          ...s,
          advance: updatedAdvance,
          due: updatedDue
        };
      }
      return s;
    });

    onUpdateStaffList(updatedStaffList);
    onAddTransaction(newTrans);

    // Reset payment states
    setPaymentAmount('');
    setPaymentNote('');
    setActiveStaffForPay(null);
  };

  // Reset/Reset Monthly Ledger (Starts a new month, sets due = monthly salary, advances remain)
  const handleStartNewMonth = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে নতুন মাসের পে-রোল সাইকেল শুরু করতে চান? এটি সবার বকেয়াকে তাদের মাসিক বেতনের সমপরিমাণ বাড়িয়ে দেবে।')) {
      const updated = staff.map(s => ({
        ...s,
        due: (s.due || 0) + s.salary
      }));
      onUpdateStaffList(updated);
      alert('নতুন মাসের পে-রোল সাইকেল সফলভাবে শুরু হয়েছে!');
    }
  };

  // Clear advances handler (Settle advances against dues)
  const handleSettleAdvance = (member: StaffMember) => {
    const adv = member.advance || 0;
    if (adv === 0) return;
    
    const settleAmount = Math.min(adv, member.due || 0);
    if (settleAmount === 0) return;

    if (window.confirm(`আপনি কি ${member.name}-এর ${settleAmount} টাকা এডভান্স ব্যালেন্স তার বকেয়া বেতনের সাথে সমন্বয় করতে চান?`)) {
      const transId = Math.random().toString(36).substring(2, 11).toUpperCase();
      const newTrans: StaffTransaction = {
        id: transId,
        staffId: member.id,
        staffName: member.name,
        type: 'DueAdjustment',
        amount: settleAmount,
        date: new Date().toISOString().split('T')[0],
        note: `এডভান্স থেকে বকেয়া বেতন সমন্বয় (${settleAmount} টাকা)`
      };

      const updated = staff.map(s => {
        if (s.id === member.id) {
          return {
            ...s,
            advance: (s.advance || 0) - settleAmount,
            due: Math.max(0, (s.due || 0) - settleAmount)
          };
        }
        return s;
      });

      onUpdateStaffList(updated);
      onAddTransaction(newTrans);
      alert('সফলভাবে এডভান্স সমন্বয় করা হয়েছে!');
    }
  };

  // Filter staff members
  const filteredStaff = staff.filter(s => {
    const translatedRole = STAFF_ROLES[s.role] || s.role;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          translatedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 flex-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="staff-payroll-section">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            কর্মকর্তা ও কর্মচারী পে-রোল ম্যানেজমেন্ট (Staff Ledger)
          </h2>
          <p className="text-xs text-slate-500 font-medium">হাসপাতালের সকল স্টাফদের বেতন, এডভান্স বা লোন এবং বকেয়া ট্র্যাকিং ও পেমেন্ট ভাউচার জেনারেটর।</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন স্টাফ যোগ করুন
          </button>
          <button
            onClick={handleStartNewMonth}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="প্রতি মাসের শুরুতে বকেয়া আপডেট করতে চাপুন"
          >
            <Layers className="w-4 h-4" />
            নতুন মাস শুরু করুন
          </button>
        </div>
      </div>

      {/* Overview Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Liability card */}
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Briefcase className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">মাসিক মোট বেতন লায়াবিলিটি</p>
            <p className="text-lg font-black text-slate-800 font-mono">৳ {totalMonthlySalaryLiability.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        {/* Advances Given card */}
        <div className="bg-amber-50/20 border border-amber-200/50 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">সর্বমোট অগ্রিম ঋণ (Advance)</p>
            <p className="text-lg font-black text-amber-700 font-mono">৳ {totalAdvancesGiven.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        {/* Remaining dues card */}
        <div className="bg-rose-50/20 border border-rose-200/50 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">মোট বকেয়া বেতন ব্যালেন্স</p>
            <p className="text-lg font-black text-rose-700 font-mono">৳ {totalDuesOutstanding.toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-50/60 p-3.5 border border-slate-200/60 rounded-xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="স্টাফের নাম বা ভূমিকা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-800"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-700"
          >
            <option value="All">সকল ভূমিকা (All Roles)</option>
            {Object.entries(STAFF_ROLES).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid Content (Staff Table + Disbursement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Staff Ledger Directory Table */}
        <div className="lg:col-span-2 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">নাম ও পদবী</th>
                  <th className="py-3 px-4 font-mono">মাসিক বেতন</th>
                  <th className="py-3 px-4 text-amber-700 font-mono">অগ্রিম লোন</th>
                  <th className="py-3 px-4 text-rose-700 font-mono">বকেয়া বেতন</th>
                  <th className="py-3 px-4 text-center">লেনদেন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 italic">কোনো স্টাফের রেকর্ড পাওয়া যায়নি।</td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[11px] uppercase border border-slate-200/60">
                            {member.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{member.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{STAFF_ROLES[member.role] || member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        ৳ {member.salary.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`font-mono font-bold ${member.advance > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            ৳ {member.advance.toLocaleString('bn-BD')}
                          </span>
                          {member.advance > 0 && member.due > 0 && (
                            <button
                              onClick={() => handleSettleAdvance(member)}
                              className="text-[9px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-1 py-0.5 rounded cursor-pointer ml-1"
                              title="এডভান্স বেতনের সাথে সমন্বয় করুন"
                            >
                              সমন্বয়
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                        ৳ {member.due.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setActiveStaffForPay(member);
                              setPaymentAmount(member.due || '');
                              setPaymentType('Salary');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="বেতন পরিশোধ এন্ট্রি"
                          >
                            <CreditCard className="w-3 h-3 text-emerald-600" />
                            ইস্যু পেমেন্ট
                          </button>
                          <button
                            onClick={() => onDeleteStaff(member.id, member.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="স্টাফ ডিলিট করুন"
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
        </div>

        {/* Right 1 Column: Disbursement panel / Payment Issuer Form */}
        <div className="space-y-4">
          {activeStaffForPay ? (
            <form onSubmit={handleIssuePaymentSubmit} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  লেনদেন ইস্যু: {activeStaffForPay.name}
                </span>
                <button 
                  type="button" 
                  onClick={() => setActiveStaffForPay(null)} 
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 font-bold transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Payment Type Selection */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">লেনদেনের ধরন *</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Salary', 'Advance', 'DueAdjustment'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setPaymentType(type);
                        if (type === 'Salary') {
                          setPaymentAmount(activeStaffForPay.due || '');
                        } else {
                          setPaymentAmount('');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-[10px] text-center cursor-pointer ${
                        paymentType === type
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'Salary' ? 'বেতন (Salary)' : type === 'Advance' ? 'অগ্রিম ঋণ' : 'বাকি সমন্বয়'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">পরিশোধিত বা অগ্রিম পরিমাণ (টাকা) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-serif">৳</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value) || '')}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-800"
                    placeholder="টাকার পরিমাণ লিখুন"
                    required
                  />
                </div>
                {paymentType === 'Salary' && (
                  <span className="text-[10px] font-bold text-rose-600">চলতি মোট বকেয়া: ৳ {activeStaffForPay.due.toLocaleString('bn-BD')}</span>
                )}
              </div>

              {/* Transaction memo/note */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">লেনদেনের বিবরণ / নোট</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="যেমন: জুন মাসের পুরো বেতন পরিশোধ"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                />
              </div>

              {/* Confirm submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                লেনদেন এন্ট্রি করুন
              </button>
            </form>
          ) : (
            <div className="bg-slate-50/50 border border-slate-200/40 p-6 rounded-2xl text-center text-slate-400 italic flex flex-col items-center justify-center min-h-[220px]">
              <Users className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-medium">লেনদেনের জন্য বাম পাশের ডিরেক্টরি থেকে যেকোনো কর্মকর্তা বা কর্মচারীর পাশে থাকা <strong className="text-slate-600">"ইস্যু পেমেন্ট"</strong> বাটনে ক্লিক করুন।</p>
            </div>
          )}
        </div>

      </div>

      {/* Ledger History Ledger Transactions Table */}
      <div className="space-y-3.5 mt-4 border-t border-slate-100 pt-5">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-600" />
          পে-রোল ও স্টাফ লেনদেন ইতিহাস (Transaction Log Ledger)
        </h3>

        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3">কর্মকর্তার নাম</th>
                  <th className="py-2.5 px-3">লেনদেনের ধরন</th>
                  <th className="py-2.5 px-3 font-mono">পরিমাণ (টাকা)</th>
                  <th className="py-2.5 px-3">মন্তব্য/নোট</th>
                  <th className="py-2.5 px-3 text-right">রসিদ প্রিন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 italic">কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{t.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.staffName}</td>
                      <td className="py-2.5 px-3">
                        {t.type === 'Salary' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            মাসিক বেতন (Salary)
                          </span>
                        ) : t.type === 'Advance' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            অগ্রিম ঋণ (Advance)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            বকেয়া সমন্বয় (Adjustment)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        ৳ {t.amount.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] font-normal">{t.note}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setActivePrintTransaction(t)}
                          className="p-1 hover:bg-slate-100 text-indigo-600 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                          title="ভাউচার রসিদ প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          প্রিন্ট
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

      {/* Add Staff Modal Form popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                নতুন স্টাফ নিবন্ধন ফরম
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewStaffSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500">স্টাফ বা কর্মচারীর নাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: মারুফ হাসান"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500">পদবী / দায়িত্ব *</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500 text-slate-700"
                >
                  {Object.entries(STAFF_ROLES).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500">মাসিক নির্ধারিত বেতন *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    placeholder="যেমন: ১৫০০০"
                    value={newStaffSalary}
                    onChange={(e) => setNewStaffSalary(Number(e.target.value) || '')}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm cursor-pointer font-bold"
                >
                  স্টাফ যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip / Payment Voucher Print Preview Modal */}
      {activePrintTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="print-receipt-modal-wrapper">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            
            {/* Modal Header controls */}
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between no-print">
              <span className="text-xs font-bold uppercase tracking-wider">রসিদ প্রিন্ট প্রিভিউ (Voucher Print Preview)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  প্রিন্ট করুন
                </button>
                <button
                  onClick={() => setActivePrintTransaction(null)}
                  className="text-slate-300 hover:text-white font-bold p-1 rounded transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Voucher Content */}
            <div className="p-6 bg-white flex-1 text-slate-800 text-xs font-serif" id="print-area">
              <div className="space-y-4 border border-slate-300 p-5 rounded-lg">
                
                {/* Hospital Header info */}
                <div className="text-center border-b border-slate-300 pb-3">
                  <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">DR. JASIM MUKUL HOSPITAL</h2>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">V.I.P. Road, Galachipa, Patuakhali.</p>
                  <div className="inline-block border border-slate-800 bg-slate-50 text-[10px] font-sans font-bold px-3 py-0.5 mt-2 rounded uppercase tracking-wider">
                    Staff Payment Voucher
                  </div>
                </div>

                {/* Patient / Staff description */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 text-[11px] font-sans">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px]">Voucher ID:</span>
                    <strong className="text-slate-800 font-mono">#{activePrintTransaction.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block uppercase text-[9px]">Date of Issue:</span>
                    <strong className="text-slate-800 font-mono">{activePrintTransaction.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px]">Issued To Employee:</span>
                    <strong className="text-slate-800 font-bold">{activePrintTransaction.staffName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block uppercase text-[9px]">Payment Method:</span>
                    <strong className="text-slate-800">Cash / Bank Transfer</strong>
                  </div>
                </div>

                {/* Details Table */}
                <div className="font-sans">
                  <table className="w-full text-left border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
                        <th className="py-1.5 px-2.5">विवরণ (Description)</th>
                        <th className="py-1.5 px-2.5 text-right">পরিমাণ (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="py-2 px-2.5 font-semibold text-slate-800">
                          {activePrintTransaction.type === 'Salary' ? (
                            <span>মাসিক বেতন পরিশোধ (Monthly Salary Disbursement)</span>
                          ) : activePrintTransaction.type === 'Advance' ? (
                            <span>অগ্রিম লোন/ঋণ প্রদান (Advance Loan Disbursed)</span>
                          ) : (
                            <span>বকেয়া বেতন সমন্বয় (Manual Due Salary Adjustment)</span>
                          )}
                          {activePrintTransaction.note && (
                            <span className="block text-[9px] text-slate-400 font-normal italic mt-0.5">নোট: {activePrintTransaction.note}</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-950">
                          ৳ {activePrintTransaction.amount.toLocaleString('bn-BD')}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50 border-t border-slate-200 font-bold">
                        <td className="py-1.5 px-2.5 text-right text-[10px] uppercase text-slate-500">Total Paid (পরিশোধিত মোট):</td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-slate-950 text-xs">
                          ৳ {activePrintTransaction.amount.toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Words info */}
                <p className="text-[10px] italic font-sans text-slate-500">
                  কথায়: {activePrintTransaction.amount.toLocaleString('bn-BD')} টাকা মাত্র।
                </p>

                {/* Signatures */}
                <div className="flex justify-between pt-10 font-sans text-[10px] text-slate-600">
                  <div className="border-t border-dashed border-slate-400 pt-1 w-24 text-center">
                    প্রস্তুতকারী (Biller)
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-1 w-24 text-center">
                    গ্রহীতার স্বাক্ষর
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-1 w-24 text-center">
                    কর্তৃপক্ষের অনুমোদন
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
