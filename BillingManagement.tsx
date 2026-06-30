import React, { useState } from 'react';
import { BillingInvoice, DiagnosticTest, Patient } from '../types';
import { Receipt, Search, Plus, Trash2, Printer, Check, DollarSign, ListFilter, Percent } from 'lucide-react';

interface BillingManagementProps {
  invoices: BillingInvoice[];
  patients: Patient[];
  onAddInvoice: (invoice: Omit<BillingInvoice, 'id' | 'createdAt'>) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  onUpdatePayment: (id: string, amountPaid: number) => void;
  onUpdateCommissionStatus: (id: string, status: 'Paid' | 'Unpaid') => void;
  selectedPatientFromDirectAction: Patient | null;
  clearDirectPatient: () => void;
  diagnosticTests?: { name: string; cost: number; category: string }[];
}

const PRESET_TESTS: { name: string; cost: number; category: string }[] = [
  // HAEMATOLOGY
  { name: '(CBC). ESR', cost: 400, category: 'HAEMATOLOGY' },
  { name: 'CBC with ESR (CC)', cost: 600, category: 'HAEMATOLOGY' },
  { name: 'TC.DC', cost: 250, category: 'HAEMATOLOGY' },
  { name: 'HB%', cost: 250, category: 'HAEMATOLOGY' },
  { name: 'ESR', cost: 200, category: 'HAEMATOLOGY' },
  { name: 'Platelet Count', cost: 300, category: 'HAEMATOLOGY' },
  { name: 'MP', cost: 200, category: 'HAEMATOLOGY' },
  { name: 'BT/CT', cost: 350, category: 'HAEMATOLOGY' },
  { name: 'C/E Count', cost: 250, category: 'HAEMATOLOGY' },

  // HORMONE PANEL
  { name: 'T3', cost: 1200, category: 'HORMONE PANEL' },
  { name: 'T4', cost: 1200, category: 'HORMONE PANEL' },
  { name: 'FT3', cost: 900, category: 'HORMONE PANEL' },
  { name: 'FT4', cost: 900, category: 'HORMONE PANEL' },
  { name: 'TSH', cost: 1100, category: 'HORMONE PANEL' },
  { name: 'HbA1c', cost: 1500, category: 'HORMONE PANEL' },
  { name: 'Prolactin', cost: 1200, category: 'HORMONE PANEL' },
  { name: 'S, IgE', cost: 1500, category: 'HORMONE PANEL' },
  { name: 'S,IgE (Device Test)', cost: 700, category: 'HORMONE PANEL' },

  // SEROLOGY
  { name: 'Widal', cost: 450, category: 'SEROLOGY' },
  { name: 'Aso Titre', cost: 450, category: 'SEROLOGY' },
  { name: 'CRP', cost: 450, category: 'SEROLOGY' },
  { name: 'RA/RF', cost: 450, category: 'SEROLOGY' },
  { name: 'HBs Ag (Screen Test)', cost: 450, category: 'SEROLOGY' },
  { name: 'TPHA', cost: 450, category: 'SEROLOGY' },
  { name: 'VDRL', cost: 400, category: 'SEROLOGY' },
  { name: 'Group & Rh Factor', cost: 200, category: 'SEROLOGY' },
  { name: 'Mantaux-Test (M.T)', cost: 300, category: 'SEROLOGY' },
  { name: 'Triple Antigen', cost: 350, category: 'SEROLOGY' },
  { name: 'R.Fever', cost: 300, category: 'SEROLOGY' },
  { name: 'HIV', cost: 500, category: 'SEROLOGY' },
  { name: 'HCV', cost: 800, category: 'SEROLOGY' },
  { name: 'TB (ICT)', cost: 750, category: 'SEROLOGY' },
  { name: 'Malaria. pf/pv', cost: 700, category: 'SEROLOGY' },
  { name: 'H. Pylori', cost: 850, category: 'SEROLOGY' },
  { name: 'Filaria (ICT)', cost: 750, category: 'SEROLOGY' },
  { name: 'Dengue NS1. IGG/IGM', cost: 300, category: 'SEROLOGY' },

  // BIO CHEMICAL ANALYSIS
  { name: 'Random', cost: 200, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Fasting', cost: 200, category: 'BIO CHEMICAL ANALYSIS' },
  { name: '2hr. After Breakfast', cost: 200, category: 'BIO CHEMICAL ANALYSIS' },
  { name: '2hr. After 75gm Glucose', cost: 200, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'O.G,T.T', cost: 500, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Blood Urea', cost: 400, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Cholesterol', cost: 350, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'HDL', cost: 400, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'TG', cost: 350, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'LDL', cost: 300, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'S,GPT(ALT)', cost: 500, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'S,GOT(AST)', cost: 500, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Bilirubin Total', cost: 350, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Lipid Profile', cost: 1000, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Bilirubin Direct/indirect', cost: 450, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Serum Creatinine', cost: 400, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Uric Acid', cost: 400, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Amylase', cost: 700, category: 'BIO CHEMICAL ANALYSIS' },
  { name: 'Calcium', cost: 600, category: 'BIO CHEMICAL ANALYSIS' },

  // X-RAY DIGITAL
  { name: 'Chest X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'PNS X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Maxilla X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Nasopharynx X-Ray', cost: 550, category: 'X-RAY DIGITAL' },
  { name: 'Abdomen A/P X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Cervical Spine X-Ray', cost: 600, category: 'X-RAY DIGITAL' },
  { name: 'Plane X-Ray Abdomen', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Mastoid Towns View X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Skull X-Ray', cost: 600, category: 'X-RAY DIGITAL' },
  { name: 'Pelvic X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Mandible B/V X-Ray', cost: 600, category: 'X-RAY DIGITAL' },
  { name: 'KUB X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'D/S Spine X-Ray', cost: 600, category: 'X-RAY DIGITAL' },
  { name: 'L/S Spine X-Ray', cost: 600, category: 'X-RAY DIGITAL' },
  { name: 'X-ray Foot B/V', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Knee B/V X-Ray', cost: 550, category: 'X-RAY DIGITAL' },
  { name: 'Elbow B/V X-Ray', cost: 500, category: 'X-RAY DIGITAL' },
  { name: 'Shoulder Joint B/V X-Ray', cost: 550, category: 'X-RAY DIGITAL' },
  { name: 'Hip Joint X-Ray', cost: 500, category: 'X-RAY DIGITAL' },

  // URINE EXAM
  { name: 'Urine Pregnancy Test (PT)', cost: 200, category: 'URINE EXAM' },
  { name: 'Urine R/E', cost: 250, category: 'URINE EXAM' },

  // STOOL EXAM
  { name: 'Stool R/E', cost: 400, category: 'STOOL EXAM' },
  { name: 'Stool OBT', cost: 400, category: 'STOOL EXAM' },

  // ULTRASOUND IMAGING (USG)
  { name: 'USG Whole Abdomen', cost: 1000, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG Upper Abdomen', cost: 800, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG Lower Abdomen', cost: 800, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG KUB', cost: 1000, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG Pregnancy Profile', cost: 800, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG Breast', cost: 1200, category: 'ULTRASOUND IMAGING (USG)' },
  { name: 'USG color doppler', cost: 1500, category: 'ULTRASOUND IMAGING (USG)' },
];

export default function BillingManagement({
  invoices,
  patients,
  onAddInvoice,
  onAddPatient,
  onUpdatePayment,
  onUpdateCommissionStatus,
  selectedPatientFromDirectAction,
  clearDirectPatient,
  diagnosticTests,
}: BillingManagementProps) {
  const testsToUse = diagnosticTests || PRESET_TESTS;
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Billing Creator Modal state
  const [isFormOpen, setIsFormOpen] = useState(selectedPatientFromDirectAction !== null);
  const [patientId, setPatientId] = useState(selectedPatientFromDirectAction?.id || '');
  const [selectedTests, setSelectedTests] = useState<DiagnosticTest[]>([]);
  
  // Dual-mode Patient entry: 'new' or 'existing'
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [directPatientName, setDirectPatientName] = useState('');
  const [directPatientPhone, setDirectPatientPhone] = useState('');
  const [directPatientAge, setDirectPatientAge] = useState('');
  const [directPatientGender, setDirectPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [directPatientAddress, setDirectPatientAddress] = useState('');

  const clearDirectInputs = () => {
    setDirectPatientName('');
    setDirectPatientPhone('');
    setDirectPatientAge('');
    setDirectPatientGender('Male');
    setDirectPatientAddress('');
    setPatientId('');
  };
  
  // Discount support: percent or flat
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Refer doctor states
  const [referredDoctors, setReferredDoctors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom_referred_doctors');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      'Self',
      'Dr. Md. Jasim Uddin (Mukul)',
      'Dr. Muh. Jasim Uddin (Mukul)',
      'Dr. Md. Sultan Mahmud',
      'Dr. Jahir Uddin Ahmed',
      'Dr. Raihan Sohag',
      'Dr. Rani Zaman'
    ];
  });
  const [selectedReferredDoctor, setSelectedReferredDoctor] = useState('Self');
  const [showAddReferDoctor, setShowAddReferDoctor] = useState(false);
  const [newReferDoctorName, setNewReferDoctorName] = useState('');

  // Sub tab view switcher
  const [subTab, setSubTab] = useState<'receipts' | 'commissions'>('receipts');

  // Doctor Commission states
  const [calculateCommission, setCalculateCommission] = useState(false);
  const [commissionType, setCommissionType] = useState<'percent' | 'flat'>('percent');
  const [commissionValue, setCommissionValue] = useState<number>(30); // default to 30%
  const [commissionPaidStatus, setCommissionPaidStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');
  const [viewCommissionDoctorName, setViewCommissionDoctorName] = useState<string | null>(null);

  // Trigger commission when doctor is selected
  React.useEffect(() => {
    if (selectedReferredDoctor && selectedReferredDoctor !== 'Self') {
      setCalculateCommission(true);
    } else {
      setCalculateCommission(false);
    }
  }, [selectedReferredDoctor]);

  // Preset Test Selector filtering states
  const [selectedTestCategory, setSelectedTestCategory] = useState('All');
  const [testSearchQuery, setTestSearchQuery] = useState('');

  // Manual Custom Test Add
  const [customTestName, setCustomTestName] = useState('');
  const [customTestCost, setCustomTestCost] = useState<number | ''>('');

  // Selected Invoice for View/Print
  const [viewInvoice, setViewInvoice] = useState<BillingInvoice | null>(null);

  // Pay Due Modal State
  const [payDueInvoice, setPayDueInvoice] = useState<BillingInvoice | null>(null);
  const [payDueAmount, setPayDueAmount] = useState<number>(0);

  React.useEffect(() => {
    if (selectedPatientFromDirectAction) {
      setPatientId(selectedPatientFromDirectAction.id);
      setPatientMode('existing');
      setIsFormOpen(true);
    }
  }, [selectedPatientFromDirectAction]);

  const handleAddPresetTest = (test: DiagnosticTest) => {
    setSelectedTests(prev => [...prev, test]);
  };

  const handleAddCustomTest = () => {
    if (!customTestName.trim() || !customTestCost) return;
    setSelectedTests(prev => [...prev, { name: customTestName.trim(), cost: Number(customTestCost) }]);
    setCustomTestName('');
    setCustomTestCost('');
  };

  const handleRemoveTest = (index: number) => {
    setSelectedTests(prev => prev.filter((_, idx) => idx !== index));
  };

  // Custom Referred Doctor list action
  const handleAddReferDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferDoctorName.trim()) return;
    const trimmed = newReferDoctorName.trim();
    if (referredDoctors.includes(trimmed)) {
      alert('This doctor is already in the list.');
      return;
    }
    const updated = [...referredDoctors, trimmed];
    setReferredDoctors(updated);
    setSelectedReferredDoctor(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_referred_doctors', JSON.stringify(updated));
    }
    setNewReferDoctorName('');
    setShowAddReferDoctor(false);
  };

  // Calculations
  const filteredPresetTests = testsToUse.filter(test => {
    const matchesCategory = selectedTestCategory === 'All' || test.category === selectedTestCategory;
    const matchesSearch = test.name.toLowerCase().includes(testSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subTotal = selectedTests.reduce((sum, t) => sum + t.cost, 0);
  const discountAmount = discountType === 'percent'
    ? Math.round((subTotal * discountValue) / 100)
    : Math.min(subTotal, discountValue);
  const netTotal = subTotal - discountAmount;
  const dueAmount = Math.max(0, netTotal - amountPaid);

  const calculatedCommissionAmount = calculateCommission
    ? (commissionType === 'percent'
        ? Math.round((subTotal * commissionValue) / 100)
        : Math.min(subTotal, commissionValue))
    : 0;

  // Group invoices by referred doctor to calculate commission totals
  const getDoctorCommissionSummaries = () => {
    const summaryMap: Record<string, {
      doctorName: string;
      referredInvoicesCount: number;
      totalBusinessAmount: number;
      totalCommissionEarned: number;
      totalCommissionPaid: number;
      totalCommissionDue: number;
      invoices: BillingInvoice[];
    }> = {};

    invoices.forEach(inv => {
      const doc = inv.referredDoctor;
      if (!doc || doc === 'Self') return;

      const commAmount = inv.commissionAmount || 0;
      const isPaid = inv.commissionPaidStatus === 'Paid';

      if (!summaryMap[doc]) {
        summaryMap[doc] = {
          doctorName: doc,
          referredInvoicesCount: 0,
          totalBusinessAmount: 0,
          totalCommissionEarned: 0,
          totalCommissionPaid: 0,
          totalCommissionDue: 0,
          invoices: []
        };
      }

      summaryMap[doc].referredInvoicesCount += 1;
      summaryMap[doc].totalBusinessAmount += inv.subTotal;
      summaryMap[doc].totalCommissionEarned += commAmount;
      if (isPaid) {
        summaryMap[doc].totalCommissionPaid += commAmount;
      } else {
        summaryMap[doc].totalCommissionDue += commAmount;
      }
      summaryMap[doc].invoices.push(inv);
    });

    return Object.values(summaryMap);
  };

  const commissionSummaries = getDoctorCommissionSummaries();
  const totalCommissionEarned = commissionSummaries.reduce((sum, s) => sum + s.totalCommissionEarned, 0);
  const totalCommissionPaid = commissionSummaries.reduce((sum, s) => sum + s.totalCommissionPaid, 0);
  const totalCommissionDue = commissionSummaries.reduce((sum, s) => sum + s.totalCommissionDue, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      alert('Please select or type at least one diagnostic test.');
      return;
    }

    let invoicePatientId = '';
    let invoicePatientName = '';
    let invoicePatientPhone = '';
    let invoicePatientAge = 0;
    let invoicePatientGender = 'Male';
    let invoicePatientAddress = '';
    let invoicePatientBloodGroup = '';

    if (patientMode === 'new') {
      if (!directPatientName.trim()) {
        alert('Please enter patient name.');
        return;
      }
      if (!directPatientAge) {
        alert('Please enter patient age.');
        return;
      }

      // Add the patient to our central database so they are saved forever
      const newPatient = onAddPatient({
        name: directPatientName.trim(),
        phone: directPatientPhone.trim() || 'N/A',
        age: Number(directPatientAge),
        gender: directPatientGender,
        address: directPatientAddress.trim() || 'N/A',
        bloodGroup: '',
        initialComplaint: '',
      });

      invoicePatientId = newPatient.id;
      invoicePatientName = newPatient.name;
      invoicePatientPhone = newPatient.phone;
      invoicePatientAge = newPatient.age;
      invoicePatientGender = newPatient.gender;
      invoicePatientAddress = newPatient.address;
      invoicePatientBloodGroup = newPatient.bloodGroup;
    } else {
      if (!patientId) {
        alert('Please select a patient.');
        return;
      }
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        alert('Selected patient not found.');
        return;
      }
      invoicePatientId = patient.id;
      invoicePatientName = patient.name;
      invoicePatientPhone = patient.phone;
      invoicePatientAge = patient.age;
      invoicePatientGender = patient.gender;
      invoicePatientAddress = patient.address;
      invoicePatientBloodGroup = patient.bloodGroup;
    }

    onAddInvoice({
      patientId: invoicePatientId,
      patientName: invoicePatientName,
      patientPhone: invoicePatientPhone,
      patientAge: invoicePatientAge,
      patientGender: invoicePatientGender,
      patientBloodGroup: invoicePatientBloodGroup,
      patientAddress: invoicePatientAddress,
      referredDoctor: selectedReferredDoctor,
      tests: selectedTests,
      subTotal,
      discount: discountAmount,
      total: netTotal,
      amountPaid,
      dueAmount,
      status: dueAmount === 0 ? 'Paid' : amountPaid === 0 ? 'Due' : 'Partial',
      commissionType: calculateCommission ? commissionType : undefined,
      commissionValue: calculateCommission ? commissionValue : undefined,
      commissionAmount: calculatedCommissionAmount,
      commissionPaidStatus: calculateCommission ? commissionPaidStatus : undefined,
    });

    // Reset creator states
    setIsFormOpen(false);
    clearDirectPatient();
    clearDirectInputs();
    setPatientMode('new');
    setSelectedTests([]);
    setDiscountValue(0);
    setAmountPaid(0);
    setSelectedReferredDoctor('Self');
    setSelectedTestCategory('All');
    setTestSearchQuery('');
    setCalculateCommission(false);
    setCommissionType('percent');
    setCommissionValue(30);
    setCommissionPaidStatus('Unpaid');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    clearDirectPatient();
    clearDirectInputs();
    setPatientMode('new');
    setSelectedTestCategory('All');
    setTestSearchQuery('');
    setDiscountValue(0);
    setAmountPaid(0);
    setSelectedReferredDoctor('Self');
    setCalculateCommission(false);
    setCommissionType('percent');
    setCommissionValue(30);
    setCommissionPaidStatus('Unpaid');
  };

  const handleUpdatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDueInvoice) return;
    const additionalPaid = Number(payDueAmount);
    if (additionalPaid <= 0 || additionalPaid > payDueInvoice.dueAmount) {
      alert('Please enter a valid paid amount.');
      return;
    }

    onUpdatePayment(payDueInvoice.id, payDueInvoice.amountPaid + additionalPaid);
    setPayDueInvoice(null);
    setPayDueAmount(0);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus ? inv.status === filterStatus : true;
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="billing-management-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Diagnostic Billing & Invoices (Billing Receipt Generator)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select tests, apply discounts, and generate payment receipts.</p>
        </div>

        <button
          onClick={() => {
            setPatientId('');
            setIsFormOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Bill
        </button>
      </div>

      {/* Sub-tab selection */}
      <div className="flex border-b border-slate-100 mb-6 gap-4">
        <button
          onClick={() => setSubTab('receipts')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'receipts'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Diagnostic Receipts & Billing (Receipts)
        </button>
        <button
          onClick={() => setSubTab('commissions')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'commissions'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Doctor Commission & Payments (Commissions)
        </button>
      </div>

      {/* Invoice Creator Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Create Diagnostic Test & Payment Receipt Form
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Patient and Test selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Select Patient & Preset Tests */}
                <div className="space-y-4">
                  {/* Patient Input Mode Selector */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setPatientMode('new')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        patientMode === 'new'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Enter New Patient Details (New Patient)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientMode('existing')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        patientMode === 'existing'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Select Registered Patient (Select Existing)
                    </button>
                  </div>

                  {patientMode === 'new' && (
                    <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-3">
                      <span className="block text-xs font-bold text-emerald-800 flex items-center gap-1.5 border-b border-emerald-100/50 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Enter New Patient Details
                      </span>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Md. Maruf Hasan"
                            value={directPatientName}
                            onChange={(e) => setDirectPatientName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                            required={patientMode === 'new'}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Number (Phone)</label>
                          <input
                            type="text"
                            placeholder="e.g. 01712345678"
                            value={directPatientPhone}
                            onChange={(e) => setDirectPatientPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Age *</label>
                          <input
                            type="number"
                            placeholder="e.g. 28"
                            value={directPatientAge}
                            onChange={(e) => setDirectPatientAge(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                            required={patientMode === 'new'}
                            min="0"
                            max="120"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender *</label>
                          <div className="flex gap-2">
                            {(['Male', 'Female', 'Other'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setDirectPatientGender(g)}
                                className={`flex-1 py-1.5 text-center font-bold border rounded-lg transition-all cursor-pointer ${
                                  directPatientGender === g
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {g === 'Male' ? 'Male' : g === 'Female' ? 'Female' : 'Other'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Address</label>
                          <input
                            type="text"
                            placeholder="e.g. Mirpur, Dhaka"
                            value={directPatientAddress}
                            onChange={(e) => setDirectPatientAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {patientMode === 'existing' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Select Registered Patient *</label>
                        <select
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                          required={patientMode === 'existing'}
                        >
                          <option value="">-- Select Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.phone})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Patient Info Display */}
                      {(() => {
                        const activePatient = patients.find(p => p.id === patientId);
                        if (!activePatient) return null;
                        return (
                          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-emerald-100/50 pb-1.5 mb-1.5">
                              <span className="font-bold text-emerald-800 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Patient Profile Details
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                                #{activePatient.id.substring(0, 6)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-700">
                              <p><span className="font-semibold text-slate-500 font-medium">Name:</span> <span className="font-bold text-slate-900">{activePatient.name}</span></p>
                              <p><span className="font-semibold text-slate-500 font-medium font-mono">Mobile:</span> <span className="font-bold text-slate-900">{activePatient.phone}</span></p>
                              <p><span className="font-semibold text-slate-500 font-medium">Age:</span> <span className="font-bold text-slate-900">{activePatient.age} Yrs</span></p>
                              <p><span className="font-semibold text-slate-500 font-medium">Gender:</span> <span className="font-bold text-slate-900">{activePatient.gender}</span></p>
                              <p><span className="font-semibold text-slate-500 font-medium">Blood Group:</span> <span className="text-rose-600 font-bold">{activePatient.bloodGroup || 'N/A'}</span></p>
                              <p className="col-span-2"><span className="font-semibold text-slate-500 font-medium">Address:</span> {activePatient.address || 'N/A'}</p>
                              {activePatient.initialComplaint && (
                                <p className="col-span-2 bg-white/70 p-1.5 rounded border border-emerald-100/40"><span className="font-semibold text-slate-500 font-medium">Primary Complaint:</span> {activePatient.initialComplaint}</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Referred Doctor Selection & Custom Referred Doctor creation */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700">Select Referred Doctor</label>
                      <button
                        type="button"
                        onClick={() => setShowAddReferDoctor(!showAddReferDoctor)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Custom Referred Doctor
                      </button>
                    </div>

                    {!showAddReferDoctor ? (
                      <select
                        value={selectedReferredDoctor}
                        onChange={(e) => setSelectedReferredDoctor(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                      >
                        {referredDoctors.map((doc, idx) => (
                          <option key={idx} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-white border border-emerald-100 rounded-lg space-y-2">
                        <span className="block text-[10px] font-bold text-emerald-900">Add New Custom Referred Doctor</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Dr. Md. Anisur Rahman"
                            value={newReferDoctorName}
                            onChange={(e) => setNewReferDoctorName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleAddReferDoctorSubmit}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-md font-bold transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddReferDoctor(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-2 py-1.5 rounded-md font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Doctor Commission section inside Refer Card */}
                    {selectedReferredDoctor && selectedReferredDoctor !== 'Self' && (
                      <div className="pt-2.5 mt-2 border-t border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={calculateCommission}
                              onChange={(e) => setCalculateCommission(e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                            />
                            Calculate Doctor's Commission
                          </label>
                        </div>

                        {calculateCommission && (
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Commission Type:</span>
                              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => { setCommissionType('percent'); setCommissionValue(30); }}
                                  className={`px-2 py-1 rounded-md font-bold transition-all ${commissionType === 'percent' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                  Percentage (%)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setCommissionType('flat'); setCommissionValue(100); }}
                                  className={`px-2 py-1 rounded-md font-bold transition-all ${commissionType === 'flat' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                  Flat Amount (৳)
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">
                                {commissionType === 'percent' ? 'Commission Rate (%)' : 'Commission Amount (৳)'}:
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={commissionValue}
                                  onChange={(e) => setCommissionValue(Math.max(0, Number(e.target.value)))}
                                  className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-800"
                                  min="0"
                                />
                                <span className="font-bold text-slate-500">{commissionType === 'percent' ? '%' : '৳'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Commission Status:</span>
                              <select
                                value={commissionPaidStatus}
                                onChange={(e) => setCommissionPaidStatus(e.target.value as any)}
                                className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-700"
                              >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 font-bold text-emerald-800">
                              <span>Total Calculated Commission:</span>
                              <span>৳ {calculatedCommissionAmount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preset Test Selector with Search & Category filters */}
                  <div className="space-y-2.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Select Diagnostic Test:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Search input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search test... (e.g. CBC, T3)"
                            value={testSearchQuery}
                            onChange={(e) => setTestSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        {/* Category Select dropdown */}
                        <select
                          value={selectedTestCategory}
                          onChange={(e) => setSelectedTestCategory(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-700"
                        >
                          <option value="All">All Categories</option>
                          <option value="HAEMATOLOGY">HAEMATOLOGY</option>
                          <option value="HORMONE PANEL">HORMONE PANEL</option>
                          <option value="SEROLOGY">SEROLOGY</option>
                          <option value="BIO CHEMICAL ANALYSIS">BIO CHEMICAL ANALYSIS</option>
                          <option value="X-RAY DIGITAL">X-RAY DIGITAL</option>
                          <option value="URINE EXAM">URINE EXAM</option>
                          <option value="STOOL EXAM">STOOL EXAM</option>
                          <option value="ULTRASOUND IMAGING (USG)">ULTRASOUND IMAGING (USG)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50">
                      {filteredPresetTests.length === 0 ? (
                        <p className="col-span-2 text-center text-slate-400 text-xs py-8">No matching test found.</p>
                      ) : (
                        filteredPresetTests.map((test, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddPresetTest({ name: test.name, cost: test.cost })}
                            className="text-left text-[11px] p-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-lg transition-all flex justify-between items-center group cursor-pointer"
                          >
                            <span className="truncate pr-1 font-medium group-hover:text-emerald-700">{test.name}</span>
                            <span className="font-bold text-slate-700 shrink-0">৳{test.cost}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Manual Test Addition */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Custom Test (Manual Input)</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Test Name"
                        value={customTestName}
                        onChange={(e) => setCustomTestName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        placeholder="Cost (৳)"
                        value={customTestCost}
                        onChange={(e) => setCustomTestCost(e.target.value !== '' ? Number(e.target.value) : '')}
                        className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTest}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Selected Tests & Calculation summary */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 space-y-4">
                  <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">Selected Tests ({selectedTests.length})</span>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedTests.length === 0 ? (
                      <p className="text-center text-slate-400 text-xs py-8">No tests added yet.</p>
                    ) : (
                      selectedTests.map((t, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">৳ {t.cost}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTest(index)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Calculations breakdown */}
                  <div className="border-t border-slate-200 pt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sub Total:</span>
                      <span className="font-semibold text-slate-800">৳ {subTotal}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-amber-500" />
                        Discount Type:
                      </span>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => { setDiscountType('percent'); setDiscountValue(0); }}
                          className={`px-2 py-1 rounded-md font-bold transition-all ${discountType === 'percent' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDiscountType('flat'); setDiscountValue(0); }}
                          className={`px-2 py-1 rounded-md font-bold transition-all ${discountType === 'flat' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Flat Amount (৳)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        {discountType === 'percent' ? 'Discount Rate (%)' : 'Discount Amount (৳)'}:
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setDiscountValue(discountType === 'percent' ? Math.min(100, val) : Math.min(subTotal, val));
                          }}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-center focus:outline-none focus:border-emerald-500 font-bold text-xs text-slate-800"
                          min="0"
                        />
                        {discountType === 'percent' && <span className="text-slate-500 font-bold text-xs">%</span>}
                        {discountType === 'flat' && <span className="text-slate-500 font-bold text-xs">৳</span>}
                      </div>
                    </div>

                    <div className="flex justify-between bg-slate-100 p-2.5 rounded-lg font-bold text-slate-800">
                      <span>Net Total:</span>
                      <span>৳ {netTotal}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Amount Paid (৳) *</label>
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(Math.min(netTotal, Math.max(0, Number(e.target.value))))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                          min="0"
                          max={netTotal}
                          required
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 mb-1">Due Amount (৳)</span>
                        <div className="w-full px-2.5 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-center font-bold text-rose-600">
                          ৳ {dueAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Print & Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Due Modal */}
      {payDueInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Collect Due Payment
            </h3>

            <form onSubmit={handleUpdatePaymentSubmit} className="space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>Patient Name: <span className="font-bold text-slate-800">{payDueInvoice.patientName}</span></p>
                <p>Total Bill: <span className="font-semibold text-slate-800">৳{payDueInvoice.total}</span></p>
                <p>Previously Paid: <span className="font-semibold text-slate-800">৳{payDueInvoice.amountPaid}</span></p>
                <p className="bg-rose-50 text-rose-600 p-2 rounded font-bold">Due Balance Amount: ৳{payDueInvoice.dueAmount}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Payment Amount (৳) *</label>
                <input
                  type="number"
                  value={payDueAmount}
                  onChange={(e) => setPayDueAmount(Math.min(payDueInvoice.dueAmount, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  min="1"
                  max={payDueInvoice.dueAmount}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setPayDueInvoice(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice View/Print Receipt Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto" id="diagnostic-print-invoice">
            <div className="text-center pb-4 border-b border-dashed border-slate-200 space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-serif">Dr. Jasim Mukul Hospital</h3>
              <p className="text-[11px] font-bold text-slate-800">DR. JASIM MUKUL HOSPITAL</p>
              <p className="text-[10px] text-slate-500">214/1 VIP Road, Galachipa, Patuakhali | Phone: 01778-070508</p>
              <span className="inline-block mt-2 bg-slate-100 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                Diagnostic Test Money Receipt
              </span>
            </div>

            {/* Patient Info */}
            <div className="py-3 border-b border-slate-100 text-[11px] space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-500">Patient ID: <span className="font-bold text-slate-700 font-mono">#{viewInvoice.patientId.substring(0, 6)}</span></p>
                  <p className="text-slate-500">Name: <span className="font-bold text-slate-800">{viewInvoice.patientName}</span></p>
                  {viewInvoice.patientAge !== undefined && (
                    <p className="text-slate-500">Age/Gender: <span className="font-semibold text-slate-700">{viewInvoice.patientAge} Yrs | {viewInvoice.patientGender}</span></p>
                  )}
                  {viewInvoice.patientBloodGroup && (
                    <p className="text-slate-500">Blood Group: <span className="font-bold text-rose-600">{viewInvoice.patientBloodGroup}</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Date: <span className="font-semibold text-slate-700">{viewInvoice.createdAt.split('T')[0]}</span></p>
                  <p className="text-slate-500">Phone: <span className="font-mono font-semibold text-slate-700">{viewInvoice.patientPhone}</span></p>
                  {viewInvoice.patientAddress && (
                    <p className="text-slate-500">Address: <span className="font-semibold text-slate-700">{viewInvoice.patientAddress}</span></p>
                  )}
                </div>
              </div>
              {viewInvoice.referredDoctor && (
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200 mt-1 text-left">
                  <p className="text-slate-600 font-semibold">Referred By: <span className="text-slate-800 font-bold">{viewInvoice.referredDoctor}</span></p>
                </div>
              )}
            </div>

            {/* Test Items */}
            <div className="py-3 text-xs">
              <p className="font-bold text-slate-700 mb-2">Test Description:</p>
              <div className="space-y-1.5">
                {viewInvoice.tests.map((t, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-600">{t.name}</span>
                    <span className="font-semibold text-slate-800">৳{t.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="py-3 border-t border-dashed border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Sub Total:</span>
                <span>৳{viewInvoice.subTotal}</span>
              </div>
              {viewInvoice.discount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Discount:</span>
                  <span>- ৳{viewInvoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-1.5">
                <span>Total Bill:</span>
                <span>৳{viewInvoice.total}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Amount Paid:</span>
                <span>৳{viewInvoice.amountPaid}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Due Amount:</span>
                <span>৳{viewInvoice.dueAmount}</span>
              </div>
            </div>

            {/* Paid status badge stamp */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${
                viewInvoice.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {viewInvoice.status === 'Paid' ? 'Paid' : 'Due'}
              </div>
              
              <span className="text-[9px] text-slate-400 italic">Please collect reports using this token slip.</span>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'commissions' ? (
        <div className="space-y-6">
          {/* Stats Summary Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Commission Assigned</span>
                <h4 className="text-lg font-bold text-slate-800 mt-1">৳ {totalCommissionEarned}</h4>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid Commission</span>
                <h4 className="text-lg font-bold text-emerald-600 mt-1">৳ {totalCommissionPaid}</h4>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Due Commission</span>
                <h4 className="text-lg font-bold text-rose-600 mt-1">৳ {totalCommissionDue}</h4>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Doctors commission summaries table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Referred Doctor</th>
                  <th className="py-3 px-4 text-center">Patient Count</th>
                  <th className="py-3 px-4 text-right">Total Test Revenue</th>
                  <th className="py-3 px-4 text-right">Assigned Commission</th>
                  <th className="py-3 px-4 text-right text-emerald-600 font-bold">Paid</th>
                  <th className="py-3 px-4 text-right text-rose-500 font-bold">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      No referral doctor commission recorded yet.
                    </td>
                  </tr>
                ) : (
                  commissionSummaries.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{s.doctorName}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{s.referredInvoicesCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">৳ {s.totalBusinessAmount}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">৳ {s.totalCommissionEarned}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">৳ {s.totalCommissionPaid}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">৳ {s.totalCommissionDue}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.totalCommissionDue === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {s.totalCommissionDue === 0 ? 'Paid' : 'Due'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewCommissionDoctorName(s.doctorName)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-all cursor-pointer"
                        >
                          Details & Pay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Invoice Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices by patient name or mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Invoices</option>
                <option value="Paid">Paid Invoices</option>
                <option value="Due">Due Invoices</option>
                <option value="Partial">Partially Paid</option>
              </select>
            </div>
          </div>

          {/* Invoice Queue List */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Test Count</th>
                  <th className="py-3 px-4 text-right">Total Bill</th>
                  <th className="py-3 px-4 text-right text-emerald-600 font-bold">Paid</th>
                  <th className="py-3 px-4 text-right text-rose-500 font-bold">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      No diagnostic payment invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{inv.id.substring(0, 6)}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{inv.patientName}</div>
                        {inv.referredDoctor && (
                          <div className="text-[10px] text-slate-500 font-medium font-semibold">Referred: {inv.referredDoctor}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{inv.patientPhone}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded">
                          {inv.tests.length} Tests
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-700">৳ {inv.total}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">৳ {inv.amountPaid}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">৳ {inv.dueAmount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : inv.status === 'Due'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {inv.status === 'Paid' ? 'Paid' : inv.status === 'Due' ? 'Due' : 'Partial'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {inv.dueAmount > 0 && (
                            <button
                              onClick={() => {
                                setPayDueInvoice(inv);
                                setPayDueAmount(inv.dueAmount);
                              }}
                              title="Collect Due Payment"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-100 transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewInvoice(inv)}
                            title="Print & View Receipt"
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Doctor Commission Invoices Modal */}
      {viewCommissionDoctorName && (() => {
        const docSummary = commissionSummaries.find(s => s.doctorName === viewCommissionDoctorName);
        if (!docSummary) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl border border-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Doctor Commission Statement</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Referred Doctor: {viewCommissionDoctorName}</p>
                </div>
                <button
                  onClick={() => setViewCommissionDoctorName(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Mini Stats inside modal */}
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold">Total Patients</span>
                  <p className="font-bold text-slate-700 mt-0.5">{docSummary.referredInvoicesCount}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold">Total Earned Commission</span>
                  <p className="font-bold text-indigo-600 mt-0.5">৳ {docSummary.totalCommissionEarned}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold text-rose-500">Total Due</span>
                  <p className="font-bold text-rose-600 mt-0.5">৳ {docSummary.totalCommissionDue}</p>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
                {docSummary.invoices.map((inv) => {
                  const isPaid = inv.commissionPaidStatus === 'Paid';
                  return (
                    <div key={inv.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{inv.patientName}</span>
                          <span className="text-[10px] font-mono text-slate-400">#{inv.id.substring(0, 5)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Total Test Bill: ৳{inv.subTotal} | Commission Rate: {inv.commissionType === 'percent' ? `${inv.commissionValue}%` : `৳${inv.commissionValue}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500">Commission Amount</p>
                          <p className="font-bold text-slate-800">৳ {inv.commissionAmount || 0}</p>
                        </div>

                        {isPaid ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                            ✓ Paid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateCommissionStatus(inv.id, 'Paid');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Pay Commission
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewCommissionDoctorName(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
