import React, { useState, useEffect } from 'react';
import { IndoorAdmission as IndoorAdmissionType, Patient } from '../types';
import { Plus, Search, Printer, Eye, Edit2, Trash2, ArrowLeft, Check, Clipboard, FileText, CheckSquare, Square, Info } from 'lucide-react';

interface IndoorAdmissionProps {
  patients: Patient[];
  admissions: IndoorAdmissionType[];
  onAddAdmission: (newAdmission: Omit<IndoorAdmissionType, 'id' | 'createdAt'>) => void;
  onUpdateAdmission: (updatedAdmission: IndoorAdmissionType) => void;
  onDeleteAdmission: (id: string) => void;
  selectedPatientFromDirectAction: Patient | null;
  clearDirectPatient: () => void;
}

const DEFAULT_RX_ITEMS = [
  { id: 1, checked: true, text: 'Nothing by mouth till F/O', val1: '' },
  { id: 2, checked: true, text: 'Inj. 5% DNS+5% DA', val1: '1000 c.c', val2: '2', val3: '30' }, // (val1) total (val2) c.c.i.v. daily @ (val3) drops/m
  { id: 3, checked: true, text: 'Inj. Ceftriaxone', val1: '1 gm', val2: '12' }, // (val1) i.v. stat and daily/(val2) hourly
  { id: 4, checked: false, text: 'Inj. Metronidazole', val1: '500 mg', val2: '8' }, // (val1) i.v. stat and (val2) hourly
  { id: 5, checked: false, text: 'Inj. Cephradin', val1: '500 mg', val2: '6' }, // (val1) i.v. stat and (val2) hourly
  { id: 6, checked: false, text: 'Inj. Ciprofloxacin', val1: '200 mg', val2: '12' }, // (val1) i.v. stat and (val2) hourly
  { id: 7, checked: true, text: 'Inj. Pethedine-75/100mg i.m stat/Nulbun-2', val1: '' },
  { id: 8, checked: true, text: 'Inj. Phenargan-1 am. i. v stat.', val1: '' },
  { id: 9, checked: true, text: 'Inj. Easium/Sedil-1 amp. 1 M.SOS and H/S daily.', val1: '' },
  { id: 10, checked: false, text: 'Inj. Diclofenac Sodium', val1: '75 mg', val2: '12' }, // (val1) amp. 1 M.stat & (val2) hourly
  { id: 11, checked: true, text: 'Inj. Omeprazol', val1: '40 mg', val2: '12' }, // (val1) amp. 1 M.stat & (val2) hourly
  { id: 12, checked: false, text: 'Inj. Ketorolac', val1: '30 mg', val2: '8' }, // (val1) amp. 1 M.stat & (val2) hourly
  { id: 13, checked: false, text: 'Inj. Ergomentrin/Metherspan', val1: '' },
  { id: 14, checked: true, text: 'Observe P/v bleeding & check Pulse. B.P.& resp. hourly & inform E.M.O./A.R/ Consultant if necessary.', val1: '' },
  { id: 15, checked: false, text: 'Inj. Traxy / Xemic 1/2 amp.stat & 1/2 amp. 1 M 8 hourly.', val1: '' },
  { id: 16, checked: false, text: 'Inj. Linda-s/Ocin/pitocin 2 amp. in each 1000 c.c, fluid for 24 hours.', val1: '' }
];

export default function IndoorAdmission({
  patients,
  admissions,
  onAddAdmission,
  onUpdateAdmission,
  onDeleteAdmission,
  selectedPatientFromDirectAction,
  clearDirectPatient
}: IndoorAdmissionProps) {
  // UI states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<IndoorAdmissionType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active viewing/printing states
  const [activePrintAdmission, setActivePrintAdmission] = useState<IndoorAdmissionType | null>(null);
  const [activePrintFormType, setActivePrintFormType] = useState<'admission' | 'consent' | 'postop' | 'discharge' | 'bill_memo'>('admission');

  // Discharge states
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<IndoorAdmissionType | null>(null);
  const [dischargeDateTime, setDischargeDateTime] = useState('');
  const [dischargeCondition, setDischargeCondition] = useState('সুস্থ (Cured)');
  const [dischargeAdvice, setDischargeAdvice] = useState('');
  const [dischargeFollowUp, setDischargeFollowUp] = useState('');
  
  // Discharge medicines list state
  const [dischargeMedicines, setDischargeMedicines] = useState<{
    name: string;
    dosage: string;
    instruction: string;
    duration: string;
  }[]>([]);
  
  // Temp inputs for discharge medicines
  const [tempDischargeMedName, setTempDischargeMedName] = useState('');
  const [tempDischargeMedDosage, setTempDischargeMedDosage] = useState('1+0+1');
  const [tempDischargeMedInstruction, setTempDischargeMedInstruction] = useState('খাবারের পর');
  const [tempDischargeMedDuration, setTempDischargeMedDuration] = useState('৭ দিন');

  // Discharge Billing states
  const [dischargeCabinCharge, setDischargeCabinCharge] = useState<number>(0);
  const [dischargeCabinDays, setDischargeCabinDays] = useState<number>(1);
  const [dischargeDoctorFee, setDischargeDoctorFee] = useState<number>(0);
  const [dischargeOpFee, setDischargeOpFee] = useState<number>(0);
  const [dischargeOtCharge, setDischargeOtCharge] = useState<number>(0);
  const [dischargeAnaesthetistFee, setDischargeAnaesthetistFee] = useState<number>(0);
  const [dischargeMedicineCharge, setDischargeMedicineCharge] = useState<number>(0);
  const [dischargeOtherCharge, setDischargeOtherCharge] = useState<number>(0);
  const [dischargeBillDiscount, setDischargeBillDiscount] = useState<number>(0);
  const [dischargeBillPaid, setDischargeBillPaid] = useState<number>(0);

  // Form tab states for splitting inputs
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'admission' | 'consent' | 'postop'>('general');

  // Form fields
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAge, setManualAge] = useState<number | ''>('');
  const [manualGender, setManualGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [regNo, setRegNo] = useState('');
  const [cabinWardBedNo, setCabinWardBedNo] = useState('');
  const [fathersHusbandsName, setFathersHusbandsName] = useState('');
  const [mothersName, setMothersName] = useState('');
  const [religion, setReligion] = useState('');
  const [occupation, setOccupation] = useState('');
  const [nationality, setNationality] = useState('Bangladeshi');
  const [guardianName, setGuardianName] = useState('');
  const [relation, setRelation] = useState('');
  const [guardianOccupation, setGuardianOccupation] = useState('');
  const [guardianNationality, setGuardianNationality] = useState('Bangladeshi');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [admissionDateTime, setAdmissionDateTime] = useState('');
  const [orderOfDoctor, setOrderOfDoctor] = useState('');

  const [doctorName, setDoctorName] = useState('');
  const [anaesthetistName, setAnaesthetistName] = useState('');
  const [consentWitnessName, setConsentWitnessName] = useState('');
  const [consentWitnessRelation, setConsentWitnessRelation] = useState('');
  const [consentWitnessAddress, setConsentWitnessAddress] = useState('');
  const [consentDate, setConsentDate] = useState('');

  const [opDate, setOpDate] = useState('');
  const [opIndication, setOpIndication] = useState('');
  const [opName, setOpName] = useState('');
  const [opAnaesthesia, setOpAnaesthesia] = useState('');
  const [opOutcome, setOpOutcome] = useState('');
  const [opSurgeon, setOpSurgeon] = useState('');
  const [opAnaesthetist, setOpAnaesthetist] = useState('');
  const [opAssistants, setOpAssistants] = useState('');
  
  // Rx state
  const [rxItems, setRxItems] = useState(DEFAULT_RX_ITEMS);

  // Auto-fill patient details
  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        setManualName(patient.name);
        setManualPhone(patient.phone);
        setManualAge(patient.age);
        setManualGender(patient.gender);
        setPresentAddress(patient.address);
      }
    }
  }, [selectedPatientId, patients]);

  // Handle direct action patient
  useEffect(() => {
    if (selectedPatientFromDirectAction) {
      setSelectedPatientId(selectedPatientFromDirectAction.id);
      setManualName(selectedPatientFromDirectAction.name);
      setManualPhone(selectedPatientFromDirectAction.phone);
      setManualAge(selectedPatientFromDirectAction.age);
      setManualGender(selectedPatientFromDirectAction.gender);
      setPresentAddress(selectedPatientFromDirectAction.address);
      
      // Auto open form
      setIsFormOpen(true);
      setActiveFormTab('general');
      
      // Generate initial Reg No
      const num = Math.floor(100000 + Math.random() * 900000);
      setRegNo(`REG-${num}`);
      
      // Set current date & time
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setAdmissionDateTime(localDateTime);
      setConsentDate(localDateTime.slice(0, 10));
      setOpDate(localDateTime.slice(0, 10));
    }
  }, [selectedPatientFromDirectAction]);

  // Open Form for Add
  const handleOpenNewForm = () => {
    setEditingAdmission(null);
    setSelectedPatientId('');
    setManualName('');
    setManualPhone('');
    setManualAge('');
    setManualGender('Male');

    setRegNo(`REG-${Math.floor(100000 + Math.random() * 900000)}`);
    setCabinWardBedNo('');
    setFathersHusbandsName('');
    setMothersName('');
    setReligion('Islam');
    setOccupation('');
    setNationality('Bangladeshi');
    setGuardianName('');
    setRelation('');
    setGuardianOccupation('');
    setGuardianNationality('Bangladeshi');
    setPresentAddress('');
    setPermanentAddress('');
    
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setAdmissionDateTime(localDateTime);
    setOrderOfDoctor('');

    setDoctorName('');
    setAnaesthetistName('');
    setConsentWitnessName('');
    setConsentWitnessRelation('');
    setConsentWitnessAddress('');
    setConsentDate(localDateTime.slice(0, 10));

    setOpDate(localDateTime.slice(0, 10));
    setOpIndication('');
    setOpName('');
    setOpAnaesthesia('');
    setOpOutcome('');
    setOpSurgeon('');
    setOpAnaesthetist('');
    setOpAssistants('');
    
    setRxItems(DEFAULT_RX_ITEMS.map(item => ({ ...item })));

    setIsFormOpen(true);
    setActiveFormTab('general');
  };

  // Open Form for Edit
  const handleOpenEditForm = (adm: IndoorAdmissionType) => {
    setEditingAdmission(adm);
    setSelectedPatientId(adm.patientId);
    setManualName(adm.patientName);
    setManualPhone(adm.patientPhone);
    setManualAge(adm.patientAge);
    setManualGender(adm.patientGender as any);

    setRegNo(adm.regNo);
    setCabinWardBedNo(adm.cabinWardBedNo);
    setFathersHusbandsName(adm.fathersHusbandsName);
    setMothersName(adm.mothersName);
    setReligion(adm.religion);
    setOccupation(adm.occupation);
    setNationality(adm.nationality);
    setGuardianName(adm.guardianName);
    setRelation(adm.relation);
    setGuardianOccupation(adm.guardianOccupation);
    setGuardianNationality(adm.guardianNationality);
    setPresentAddress(adm.presentAddress);
    setPermanentAddress(adm.permanentAddress);
    setAdmissionDateTime(adm.admissionDateTime);
    setOrderOfDoctor(adm.orderOfDoctor);

    setDoctorName(adm.doctorName);
    setAnaesthetistName(adm.anaesthetistName);
    setConsentWitnessName(adm.consentWitnessName);
    setConsentWitnessRelation(adm.consentWitnessRelation);
    setConsentWitnessAddress(adm.consentWitnessAddress);
    setConsentDate(adm.consentDate);

    setOpDate(adm.opDate);
    setOpIndication(adm.opIndication);
    setOpName(adm.opName);
    setOpAnaesthesia(adm.opAnaesthesia);
    setOpOutcome(adm.opOutcome);
    setOpSurgeon(adm.opSurgeon);
    setOpAnaesthetist(adm.opAnaesthetist);
    setOpAssistants(adm.opAssistants);
    
    // Map items or restore defaults
    const savedRx = DEFAULT_RX_ITEMS.map(def => {
      const match = adm.rxItems?.find(r => r.id === def.id);
      if (match) {
        return {
          ...def,
          checked: match.checked,
          val1: match.val1 ?? def.val1,
          val2: match.val2 ?? def.val2,
          val3: match.val3 ?? def.val3,
        };
      }
      return { ...def };
    });
    setRxItems(savedRx);

    setIsFormOpen(true);
    setActiveFormTab('general');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAdmission(null);
    clearDirectPatient();
  };

  // Discharge patient handlers
  const handleOpenDischargeModal = (adm: IndoorAdmissionType) => {
    setDischargeTarget(adm);
    
    // Default discharge date/time to now
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setDischargeDateTime(localDateTime);
    
    // Set existing values if editing discharge or default
    setDischargeCondition(adm.dischargeCondition || 'সুস্থ (Cured)');
    setDischargeAdvice(adm.dischargeAdvice || '১. নিয়মিত পরিষ্কার হালকা গরম পানি দিয়ে গোসল করবেন।\n২. ভারি কোনো ওজন বহন বা পরিশ্রম করবেন না।\n৩. কোনো সমস্যা হলে তাৎক্ষণিক ডাক্তারের সাথে যোগাযোগ করবেন।');
    setDischargeMedicines(adm.dischargeMedicines || []);
    setDischargeFollowUp(adm.followUpDate || '৭ দিন পর');

    // Initialize bill values
    setDischargeCabinCharge(adm.dischargeCabinCharge || 0);
    setDischargeCabinDays(adm.dischargeCabinDays || 1);
    setDischargeDoctorFee(adm.dischargeDoctorFee || 0);
    setDischargeOpFee(adm.dischargeOpFee || 0);
    setDischargeOtCharge(adm.dischargeOtCharge || 0);
    setDischargeAnaesthetistFee(adm.dischargeAnaesthetistFee || 0);
    setDischargeMedicineCharge(adm.dischargeMedicineCharge || 0);
    setDischargeOtherCharge(adm.dischargeOtherCharge || 0);
    setDischargeBillDiscount(adm.dischargeBillDiscount || 0);
    setDischargeBillPaid(adm.dischargeBillPaid || 0);
    
    setIsDischargeModalOpen(true);
  };

  const handleCloseDischargeModal = () => {
    setIsDischargeModalOpen(false);
    setDischargeTarget(null);
    setTempDischargeMedName('');
  };

  const handleAddDischargeMedicine = () => {
    if (!tempDischargeMedName.trim()) return;
    setDischargeMedicines(prev => [
      ...prev,
      {
        name: tempDischargeMedName,
        dosage: tempDischargeMedDosage,
        instruction: tempDischargeMedInstruction,
        duration: tempDischargeMedDuration
      }
    ]);
    setTempDischargeMedName('');
  };

  const handleRemoveDischargeMedicine = (index: number) => {
    setDischargeMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleDischargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeTarget) return;

    const subtotal = (dischargeCabinCharge * dischargeCabinDays) + dischargeDoctorFee + dischargeOpFee + dischargeOtCharge + dischargeAnaesthetistFee + dischargeMedicineCharge + dischargeOtherCharge;
    const total = Math.max(0, subtotal - dischargeBillDiscount);
    const due = Math.max(0, total - dischargeBillPaid);

    const updated: IndoorAdmissionType = {
      ...dischargeTarget,
      status: 'Discharged',
      dischargeDateTime,
      dischargeCondition,
      dischargeAdvice,
      dischargeMedicines,
      followUpDate: dischargeFollowUp,
      // Bill fields
      dischargeCabinCharge,
      dischargeCabinDays,
      dischargeDoctorFee,
      dischargeOpFee,
      dischargeOtCharge,
      dischargeAnaesthetistFee,
      dischargeMedicineCharge,
      dischargeOtherCharge,
      dischargeBillSubtotal: subtotal,
      dischargeBillDiscount,
      dischargeBillTotal: total,
      dischargeBillPaid,
      dischargeBillDue: due
    };

    onUpdateAdmission(updated);
    handleCloseDischargeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName) {
      alert('রোগীর নাম আবশ্যক!');
      return;
    }

    const data = {
      patientId: selectedPatientId || 'DIRECT',
      patientName: manualName,
      patientPhone: manualPhone,
      patientAge: Number(manualAge) || 0,
      patientGender: manualGender,
      regNo,
      cabinWardBedNo,
      fathersHusbandsName,
      mothersName,
      religion,
      occupation,
      nationality,
      guardianName,
      relation,
      guardianOccupation,
      guardianNationality,
      presentAddress,
      permanentAddress,
      admissionDateTime,
      orderOfDoctor,
      doctorName,
      anaesthetistName,
      consentWitnessName,
      consentWitnessRelation,
      consentWitnessAddress,
      consentDate,
      opDate,
      opIndication,
      opName,
      opAnaesthesia,
      opOutcome,
      opSurgeon,
      opAnaesthetist,
      opAssistants,
      rxItems: rxItems.map(r => ({
        id: r.id,
        checked: r.checked,
        val1: r.val1,
        val2: r.val2,
        val3: r.val3
      }))
    };

    if (editingAdmission) {
      onUpdateAdmission({
        ...editingAdmission,
        ...data
      });
    } else {
      onAddAdmission(data);
    }

    handleCloseForm();
  };

  // Filter admissions list
  const filteredAdmissions = admissions.filter(adm => {
    const query = searchQuery.toLowerCase();
    return (
      adm.patientName.toLowerCase().includes(query) ||
      adm.patientPhone.toLowerCase().includes(query) ||
      adm.regNo.toLowerCase().includes(query) ||
      adm.cabinWardBedNo.toLowerCase().includes(query)
    );
  });

  // Handle printing trigger
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* List / Search Header */}
      {!isFormOpen && !activePrintAdmission && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">ইনডোর অ্যাডমিশন ও ভর্তি রোগী তালিকা</h2>
              <p className="text-xs text-slate-500 font-medium">হাসপাতালে ভর্তি হওয়া রোগীদের ফর্মসমূহ ও অপারেশন ডাটাবেজ</p>
            </div>
            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন রোগী ভর্তি করান
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="ভর্তি হওয়া রোগী খুঁজুন (নাম, মোবাইল, রেজিঃ নং, কেবিন)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>

          {filteredAdmissions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Clipboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-medium">কোনো ভর্তি রোগীর রেকর্ড পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">রেজিঃ নং</th>
                    <th className="py-3 px-4">রোগীর নাম</th>
                    <th className="py-3 px-4">মোবাইল</th>
                    <th className="py-3 px-4">কেবিন/বেড</th>
                    <th className="py-3 px-4">ভর্তির সময়</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{adm.regNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{adm.patientName}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{adm.patientPhone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 w-max">
                            {adm.cabinWardBedNo || 'N/A'}
                          </span>
                          {adm.status === 'Discharged' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm w-max border border-slate-200">
                              ছুটি হয়েছে (Discharged)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm w-max border border-emerald-100 animate-pulse">
                              ভর্তি আছেন (Admitted)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {adm.admissionDateTime ? new Date(adm.admissionDateTime).toLocaleString('bn-BD') : 'N/A'}
                        {adm.status === 'Discharged' && adm.dischargeDateTime && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            ছুটি: {new Date(adm.dischargeDateTime).toLocaleString('bn-BD')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {adm.status !== 'Discharged' ? (
                          <button
                            onClick={() => handleOpenDischargeModal(adm)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                            title="রোগীকে ছুটি দিন (Discharge Patient)"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            ছুটি দিন
                          </button>
                        ) : (
                          <button
                            onClick={() => { setActivePrintAdmission(adm); setActivePrintFormType('discharge'); }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                            title="ছাড়পত্র প্রিন্ট (Print Discharge Summary)"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            ছাড়পত্র
                          </button>
                        )}
                        <button
                          onClick={() => { setActivePrintAdmission(adm); setActivePrintFormType('admission'); }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                          title="ভর্তি ফর্ম প্রিন্ট"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          প্রিন্ট
                        </button>
                        <button
                          onClick={() => handleOpenEditForm(adm)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all cursor-pointer inline-flex"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('আপনি কি নিশ্চিত এই ভর্তি রেকর্ডটি মুছতে চান?')) onDeleteAdmission(adm.id); }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer inline-flex"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Forms input section */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {editingAdmission ? 'ভর্তি তথ্য সংশোধন করুন' : 'নতুন ইনডোর রোগী ভর্তি ফর্ম'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">একক ফর্ম থেকেই ৩টি আলাদা প্রিন্ট কপি জেনারেট হবে</p>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ফিরে যান
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveFormTab('general')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeFormTab === 'general'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ১. রোগী ও সাধারণ তথ্য
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('admission')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeFormTab === 'admission'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ২. ভর্তি ফরম (Admission Extra)
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('consent')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeFormTab === 'consent'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ৩. অস্ত্রোপচার সম্মতি (Consent)
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('postop')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeFormTab === 'postop'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ৪. পোস্ট অপারেটিভ ও Rx
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">

            {/* TAB 1: General Info */}
            {activeFormTab === 'general' && (
              <div className="space-y-4">
                <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    ইতিমধ্যেই নিবন্ধিত কোনো রোগীকে নির্বাচন করলে তাঁর নাম, বয়স, জেন্ডার ইত্যাদি তথ্য স্বয়ংক্রিয়ভাবে বসে যাবে। এছাড়া সরাসরি নতুন কোনো রোগীর নাম লিখেও ভর্তি সম্পন্ন করতে পারেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">নিবন্ধিত রোগী সিলেক্ট করুন (ঐচ্ছিক):</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- রোগী নির্বাচন করুন --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.phone || 'N/A'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">রেজিস্ট্রেশন নম্বর (Reg No):</label>
                    <input
                      type="text"
                      required
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">রোগীর নাম (চিকিৎসা প্রার্থী): *</label>
                    <input
                      type="text"
                      required
                      placeholder="রোগীর সম্পূর্ণ নাম লিখুন"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">কেবিন / ওয়ার্ড / বেড নং (Cabin/Bed): *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Cabin-302, Ward-B, Bed-4"
                      value={cabinWardBedNo}
                      onChange={(e) => setCabinWardBedNo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">বয়স (Age):</label>
                      <input
                        type="number"
                        placeholder="বয়স"
                        value={manualAge}
                        onChange={(e) => setManualAge(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">জেন্ডার (Sex):</label>
                      <select
                        value={manualGender}
                        onChange={(e) => setManualGender(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল নম্বর (Mobile):</label>
                    <input
                      type="text"
                      placeholder="যেমন: 017XXXXXXXX"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('admission')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পরবর্তী ধাপে যান
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Admission Specifics */}
            {activeFormTab === 'admission' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">পিতা / স্বামীর নাম (Father/Husband Name):</label>
                    <input
                      type="text"
                      placeholder="পিতা বা স্বামীর নাম লিখুন"
                      value={fathersHusbandsName}
                      onChange={(e) => setFathersHusbandsName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">মাতার নাম (Mother's Name):</label>
                    <input
                      type="text"
                      placeholder="মাতার নাম লিখুন"
                      value={mothersName}
                      onChange={(e) => setMothersName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ধর্ম (Religion):</label>
                      <input
                        type="text"
                        placeholder="Islam/Hindu"
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">পেশা (Occ.):</label>
                      <input
                        type="text"
                        placeholder="Business/Job"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">জাতীয়তা (Nat.):</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">অভিভাবকের নাম (Guardian Name):</label>
                    <input
                      type="text"
                      placeholder="অভিভাবকের নাম"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">সম্পর্ক (Relation):</label>
                      <input
                        type="text"
                        placeholder="যেমন: ভাই/পিতা/মা"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">অভিভাবক পেশা:</label>
                      <input
                        type="text"
                        placeholder="পেশা"
                        value={guardianOccupation}
                        onChange={(e) => setGuardianOccupation(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">অভিভাবক জাতীয়তা:</label>
                      <input
                        type="text"
                        value={guardianNationality}
                        onChange={(e) => setGuardianNationality(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ভর্তির তারিখ ও সময় (Admission Date/Time):</label>
                    <input
                      type="datetime-local"
                      value={admissionDateTime}
                      onChange={(e) => setAdmissionDateTime(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">বর্তমান ঠিকানা (Present Address):</label>
                    <textarea
                      rows={2}
                      placeholder="বর্তমান ঠিকানা লিখুন"
                      value={presentAddress}
                      onChange={(e) => setPresentAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">স্থায়ী ঠিকানা (Permanent Address):</label>
                    <textarea
                      rows={2}
                      placeholder="স্থায়ী ঠিকানা লিখুন (খালি থাকলে বর্তমান ঠিকানা প্রিন্ট হবে)"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ডাক্তারের নির্দেশ (Order Of Doctor):</label>
                    <textarea
                      rows={3}
                      placeholder="ডাক্তারের কোনো বিশেষ নির্দেশ বা ওষুধপত্রাদি..."
                      value={orderOfDoctor}
                      onChange={(e) => setOrderOfDoctor(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('general')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পূর্ববর্তী ধাপ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('consent')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পরবর্তী ধাপে যান
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Surgery Consent Specifics */}
            {activeFormTab === 'consent' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">মনোনীত সার্জন/ডাক্তার (Surgeon Name):</label>
                    <input
                      type="text"
                      placeholder="ডাঃ জসিম মুকুল বা অন্য সার্জন"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">অজ্ঞানকারী ডাক্তার (Anaesthetist Name):</label>
                    <input
                      type="text"
                      placeholder="ডাঃ [এনেস্থেটিস্ট এর নাম]"
                      value={anaesthetistName}
                      onChange={(e) => setAnaesthetistName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">সম্মতিপত্র স্বাক্ষরকারীর নাম (Witness/Signee Name):</label>
                    <input
                      type="text"
                      placeholder="রোগীর অভিভাবক বা রোগীর নিজের নাম"
                      value={consentWitnessName}
                      onChange={(e) => setConsentWitnessName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">রোগীর সাথে সম্পর্ক (Relation):</label>
                      <input
                        type="text"
                        placeholder="যেমন: পিতা/মাতা/স্বয়ং"
                        value={consentWitnessRelation}
                        onChange={(e) => setConsentWitnessRelation(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">সম্মতি দেওয়ার তারিখ (Date):</label>
                      <input
                        type="date"
                        value={consentDate}
                        onChange={(e) => setConsentDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">স্বাক্ষরকারীর ঠিকানা (Signee Address):</label>
                    <textarea
                      rows={2}
                      placeholder="স্বাক্ষরকারীর স্থায়ী বা বর্তমান ঠিকানা"
                      value={consentWitnessAddress}
                      onChange={(e) => setConsentWitnessAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('admission')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পূর্ববর্তী ধাপ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('postop')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পরবর্তী ধাপে যান
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Post Operative Order */}
            {activeFormTab === 'postop' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5 mb-3">ক) অপারেশন নোট (Operation Note)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">অপারেশনের তারিখ (Operation Date):</label>
                      <input
                        type="date"
                        value={opDate}
                        onChange={(e) => setOpDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ইন্ডিকেশন (Indication - অপারেশনের কারণ):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Acute Appendicitis, Hernia"
                        value={opIndication}
                        onChange={(e) => setOpIndication(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">অপারেশনের নাম (Operation Done):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Appendectomy, Hernioplasty"
                        value={opName}
                        onChange={(e) => setOpName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">এনেস্থেসিয়া ধরণ (Anaesthesia Type):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Spinal, General, Local"
                        value={opAnaesthesia}
                        onChange={(e) => setOpAnaesthesia(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">সার্জন (Surgeon):</label>
                      <input
                        type="text"
                        placeholder="সার্জনের নাম"
                        value={opSurgeon}
                        onChange={(e) => setOpSurgeon(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">এনেস্থেটিস্ট (Anaesthetist):</label>
                      <input
                        type="text"
                        placeholder="এনেস্থেটিস্ট ডাক্তারের নাম"
                        value={opAnaesthetist}
                        onChange={(e) => setOpAnaesthetist(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">সহকারীগণ (Assistants):</label>
                      <input
                        type="text"
                        placeholder="সহকারী নার্স বা ডাক্তারদের নাম"
                        value={opAssistants}
                        onChange={(e) => setOpAssistants(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ফাইন্ডিংস / ফলাফল (Outcome/Findings):</label>
                      <textarea
                        rows={2}
                        placeholder="যেমন: Appendix was inflamed but intact, pelvic fluid clear."
                        value={opOutcome}
                        onChange={(e) => setOpOutcome(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5 mb-3 flex items-center justify-between">
                    <span>খ) পোস্ট অপারেটিভ মেডিকেশন অর্ডার (Rx)</span>
                    <span className="text-[10px] text-slate-400 font-medium">ডানপাশের ফর্মে প্রিন্ট হওয়া ঔষধ চেক ও ফিল করুন</span>
                  </h3>
                  
                  <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50 max-h-[350px] overflow-y-auto">
                    {rxItems.map((item, index) => (
                      <div key={item.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...rxItems];
                            updated[index].checked = !updated[index].checked;
                            setRxItems(updated);
                          }}
                          className="mt-0.5 text-slate-500 hover:text-emerald-600 transition-all cursor-pointer"
                        >
                          {item.checked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{index + 1}. {item.text}</span>
                          </div>

                          {/* Render custom input slots based on item id */}
                          {item.id === 2 && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>total</span>
                              <input
                                type="text"
                                placeholder="যেমন: 1000 c.c"
                                value={item.val1 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val1 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-28 text-center font-bold"
                              />
                              <span>c.c.i.v. daily @</span>
                              <input
                                type="text"
                                placeholder="যেমন: 30"
                                value={item.val3 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val3 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-16 text-center font-bold"
                              />
                              <span>drops/m.</span>
                            </div>
                          )}

                          {item.id === 3 && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>Brand/Type:</span>
                              <input
                                type="text"
                                placeholder="যেমন: Ceftron"
                                value={item.val1 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val1 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-28 text-center font-bold"
                              />
                              <span>1 gm i.v. stat and daily/</span>
                              <input
                                type="text"
                                placeholder="যেমন: 12"
                                value={item.val2 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val2 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-16 text-center font-bold"
                              />
                              <span>hourly..</span>
                            </div>
                          )}

                          {(item.id === 4 || item.id === 5 || item.id === 6) && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>Brand/Type:</span>
                              <input
                                type="text"
                                placeholder="যেমন: brand name"
                                value={item.val1 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val1 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-28 text-center font-bold"
                              />
                              <span>vial/bag i.v. stat and</span>
                              <input
                                type="text"
                                placeholder="যেমন: 8"
                                value={item.val2 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val2 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-16 text-center font-bold"
                              />
                              <span>hourly.</span>
                            </div>
                          )}

                          {(item.id === 10 || item.id === 11 || item.id === 12) && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>Brand/Type:</span>
                              <input
                                type="text"
                                placeholder="যেমন: brand name"
                                value={item.val1 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val1 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-28 text-center font-bold"
                              />
                              <span>amp/vial stat &</span>
                              <input
                                type="text"
                                placeholder="যেমন: 12"
                                value={item.val2 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val2 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-16 text-center font-bold"
                              />
                              <span>hourly.</span>
                            </div>
                          )}

                          {item.id === 13 && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>Brand/Type:</span>
                              <input
                                type="text"
                                placeholder="যেমন: Methergin"
                                value={item.val1 || ''}
                                onChange={(e) => {
                                  const updated = [...rxItems];
                                  updated[index].val1 = e.target.value;
                                  setRxItems(updated);
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 text-xs w-48 text-center font-bold"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('consent')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    পূর্ববর্তী ধাপ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {editingAdmission ? 'ভর্তি তথ্য আপডেট করুন' : 'ভর্তি সম্পন্ন ও সংরক্ষণ করুন'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Elegant printing/preview modal modal overlay */}
      {activePrintAdmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center py-6 px-4 print:p-0 print:bg-white print:relative print:inset-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col print:border-none print:shadow-none print:rounded-none">
            
            {/* Top Preview controller bar */}
            <div className="bg-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">প্রিন্ট ভিউ ও ফর্ম নির্বাচন</h3>
                  <p className="text-sm font-bold text-white">{activePrintAdmission.patientName} ({activePrintAdmission.regNo})</p>
                </div>
              </div>

              {/* Selector buttons for the three forms */}
              <div className="flex bg-slate-700 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setActivePrintFormType('admission')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePrintFormType === 'admission' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ১. Admission Form
                </button>
                <button
                  onClick={() => setActivePrintFormType('consent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePrintFormType === 'consent' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ২. অস্ত্রোপচার সম্মতিপত্র
                </button>
                <button
                  onClick={() => setActivePrintFormType('postop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePrintFormType === 'postop' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৩. Post Operative Order
                </button>
                {activePrintAdmission.status === 'Discharged' && (
                  <>
                    <button
                      onClick={() => setActivePrintFormType('discharge')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePrintFormType === 'discharge' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ৪. রিলিজ ছাড়পত্র
                    </button>
                    <button
                      onClick={() => setActivePrintFormType('bill_memo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePrintFormType === 'bill_memo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ৫. বিল মেমো (Bill Memo)
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={triggerPrint}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট করুন
                </button>
                <button
                  onClick={() => { setActivePrintAdmission(null); }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Printable Area with exact replica styling */}
            <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50 print:p-0 print:bg-white flex justify-center">
              
              <div className="bg-white w-[790px] min-h-[1050px] p-10 border border-slate-200 print:border-none print:shadow-none print:p-0 shadow-md relative flex flex-col justify-between text-black font-sans leading-relaxed">
                
                {/* FORM 1: ADMISSION FORM */}
                {activePrintFormType === 'admission' && (
                  <div className="space-y-6 flex-1">
                    
                    {/* Header Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                      {/* Logo caduceus */}
                      <div className="flex items-center gap-3">
                        <div className="border border-slate-800 px-3 py-1 rounded text-center">
                          <p className="text-[12px] font-bold tracking-widest text-indigo-900">DJ MH</p>
                          <div className="w-6 h-px bg-slate-800 mx-auto my-0.5"></div>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Hospital</span>
                        </div>
                        <div>
                          <h2 className="text-[25px] font-extrabold tracking-tight text-slate-950 font-serif">DR. JASIM MUKUL HOSPITAL</h2>
                          <p className="text-[13px] font-bold text-slate-700">V.I.P. Road, Galachipa, Patuakhali.</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Title */}
                    <div className="text-center my-4">
                      <span className="text-[18px] font-extrabold px-10 py-1.5 border border-slate-800 rounded-full bg-slate-50 tracking-wider">
                        Admission Form
                      </span>
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4 text-sm mt-8">
                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Reg. No.</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-mono font-bold text-slate-800 px-2">{activePrintAdmission.regNo}</div>
                      </div>
                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Cabin/Ward/Bed No.</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.cabinWardBedNo}</div>
                      </div>
                    </div>

                    {/* Patient detail lines */}
                    <div className="space-y-4 text-sm mt-4">
                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Patient's Name :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.patientName}</div>
                        </div>
                        <div className="flex items-baseline w-[150px]">
                          <span className="font-bold whitespace-nowrap">Sex :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.patientGender}</div>
                        </div>
                        <div className="flex items-baseline w-[150px]">
                          <span className="font-bold whitespace-nowrap">Age :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.patientAge} Years</div>
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Father's/Husband's Name :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.fathersHusbandsName || 'N/A'}</div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Mother's Name :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.mothersName || 'N/A'}</div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Religion :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.religion || 'N/A'}</div>
                        </div>
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Occupation :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.occupation || 'N/A'}</div>
                        </div>
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Nationality :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.nationality || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Guardian Name :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.guardianName || 'N/A'}</div>
                        </div>
                        <div className="flex items-baseline w-[220px]">
                          <span className="font-bold whitespace-nowrap">Relation :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.relation || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Occupation :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.guardianOccupation || 'N/A'}</div>
                        </div>
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold whitespace-nowrap">Nationality :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.guardianNationality || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Present Address :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.presentAddress || 'N/A'}</div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Tel./ Mobile # :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">{activePrintAdmission.patientPhone || 'N/A'}</div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Permanent Address :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">
                          {activePrintAdmission.permanentAddress || activePrintAdmission.presentAddress || 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-bold whitespace-nowrap">Date & Time of Admission :</span>
                        <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-800 px-2">
                          {activePrintAdmission.admissionDateTime ? new Date(activePrintAdmission.admissionDateTime).toLocaleString('bn-BD') : 'N/A'}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-4">
                        <span className="font-bold">Order Of Doctor :</span>
                        <div className="min-h-[140px] border border-slate-300 rounded-lg p-3 bg-slate-50/50 leading-relaxed text-[13px] text-slate-800 font-medium whitespace-pre-wrap">
                          {activePrintAdmission.orderOfDoctor || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Signature lines */}
                    <div className="pt-16 flex justify-end">
                      <div className="text-center w-[250px]">
                        <div className="border-t border-slate-900 pt-1.5 font-bold text-xs">
                          Signature of Medical Officer/Dr.
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* FORM 2: CONSENT FORM FOR SURGERY */}
                {activePrintFormType === 'consent' && (
                  <div className="space-y-5 flex-1 text-slate-900 font-serif" style={{ fontFamily: 'Siyam Rupali, Vrinda, SolaimanLipi, Kalpurush, sans-serif' }}>
                    
                    {/* Header bangla */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="border border-slate-800 px-3 py-1 rounded text-center shrink-0">
                          <p className="text-[12px] font-bold tracking-widest text-indigo-900">DJ MH</p>
                          <div className="w-6 h-px bg-slate-800 mx-auto my-0.5"></div>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Hospital</span>
                        </div>
                        <div>
                          <h2 className="text-[26px] font-extrabold text-slate-950">ডাঃ জসিম মুকুল হাসপাতাল</h2>
                          <p className="text-[13px] font-bold text-slate-700">ভি.আই.পি. রোড, গলাচিপা, পটুয়াখালী।</p>
                        </div>
                      </div>
                    </div>

                    {/* Consent Title */}
                    <div className="text-center my-4">
                      <span className="text-[18px] font-extrabold px-10 py-1.5 border border-slate-800 rounded-lg bg-slate-50 tracking-wider">
                        অস্ত্রোপচারের সম্মতি পত্র
                      </span>
                    </div>

                    {/* Body Fields */}
                    <div className="space-y-4 text-[13.5px] leading-8 mt-6">
                      
                      <div className="flex flex-wrap gap-x-4">
                        <div className="flex items-baseline flex-1">
                          <span>চিকিৎসা প্রার্থী:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-950 px-2">{activePrintAdmission.patientName}</div>
                        </div>
                        <div className="flex items-baseline w-[130px]">
                          <span>বয়স:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-950 px-2">{activePrintAdmission.patientAge}</div>
                        </div>
                        <div className="flex items-baseline w-[200px]">
                          <span>কেবিন/বেড নং:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-950 px-2">{activePrintAdmission.cabinWardBedNo}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4">
                        <div className="flex items-baseline flex-1">
                          <span>রেজিঃ নং:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-950 px-2 font-mono">{activePrintAdmission.regNo}</div>
                        </div>
                        <div className="flex items-baseline flex-[2]">
                          <span>পিতা/স্বামী/অভিভাবক এর নাম:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-950 px-2">
                            {activePrintAdmission.fathersHusbandsName || activePrintAdmission.guardianName || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Legal Paragraphs */}
                      <p className="text-justify indent-8 leading-relaxed mt-4">
                        চিকিৎসা প্রার্থী আমি নিজে/ আমার পিতা/মাতা/স্ত্রী/পুত্র/কন্যা উপরোক্ত চিকিৎসা প্রার্থীর অস্ত্রোপচার সম্পন্ন করার জন্য আমি ডাঃ <span className="font-bold underline px-1.5">{activePrintAdmission.doctorName || 'জসিম মুকুল'}</span> কে এবং তার মনোনীত সহকারীদের মনোনীত করছি। যদি অস্ত্রোপচার প্রক্রিয়ার মধ্যে কোন নতুন পরিস্থিতি, জটিলতা ও উপসর্গ দেখা দেয় তবে সে ক্ষেত্রে বাস্তব অবস্থার প্রেক্ষিতে প্রয়োজনীয় সিদ্ধান্ত ও ব্যবস্থা গ্রহণের জন্য আমি তাঁর উপর আস্থা রাখছি।
                      </p>

                      <p className="text-justify indent-8 leading-relaxed">
                        উপরোক্ত অস্ত্রোপচারের উদ্দেশ্য এবং প্রকৃতি চিকিৎসা সংক্রান্ত বিকল্প পদ্ধতি, এ সংক্রান্ত ঝুঁকি এবং এর সাথে জড়িত যা কিছু জটিলতা সে সব পুরোপুরি ভাবে আমার কাছে ব্যাখ্যা করা হয়েছে। অস্ত্রোপচারের ফলাফল অনুকুল হওয়ার নিশ্চয়তা যে নেই তাও আমাকে জানানো হয়েছে।
                      </p>

                      <p className="text-justify indent-8 leading-relaxed">
                        অস্ত্রোপচার চলাকালীন অজ্ঞান করার দায়িত্ব আমার সম্মতিক্রমে ডাঃ <span className="font-bold underline px-1.5">{activePrintAdmission.anaesthetistName || '..............................................'}</span> কে দেওয়া হচ্ছে এবং তিনি এ ব্যাপারে প্রয়োজন মাত পদক্ষেপ গ্রহণ করবেন।
                      </p>

                      <p className="text-justify indent-8 leading-relaxed">
                        আমি এ মর্মে নিশ্চয়তা দিচ্ছি, আমি অস্ত্রোপচার সংক্রান্ত উক্ত সম্মতি পুরোপুরি পড়েছি, প্রয়োজনীয় বিষয়গুলো যথাযথ ভাবে আমার কাছে ব্যাখ্যা করা হয়েছে।
                      </p>

                      <p className="font-bold text-slate-900 mt-2 text-center">
                        শূণ্য ঘরগুলো যথাযথ ভাবে পূরণ করার পর আমি সম্মতিক্রমে স্বাক্ষর করছি।
                      </p>
                    </div>

                    {/* Bangla Signatures Bottom Columns */}
                    <div className="grid grid-cols-2 gap-10 pt-16 text-xs">
                      
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">স্বাক্ষরের স্বাক্ষর:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 h-4"></div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">সম্পর্ক:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 font-bold px-2">{activePrintAdmission.consentWitnessRelation || '.......................'}</div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">স্বাক্ষরীর নাম:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 font-bold px-2">{activePrintAdmission.consentWitnessName || '.......................'}</div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">তারিখ:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 font-bold px-2">
                            {activePrintAdmission.consentDate ? new Date(activePrintAdmission.consentDate).toLocaleDateString('bn-BD') : '.......................'}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">অভিভাবকের স্বাক্ষর:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 h-4"></div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">স্বাক্ষর দাতার নাম:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 h-4"></div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">ঠিকানা:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 font-bold px-2">
                            {activePrintAdmission.consentWitnessAddress || '.......................'}
                          </div>
                        </div>
                        <div className="flex items-baseline">
                          <span className="whitespace-nowrap">তারিখ:</span>
                          <div className="flex-1 border-b border-slate-400 ml-2 font-bold px-2">
                            {activePrintAdmission.consentDate ? new Date(activePrintAdmission.consentDate).toLocaleDateString('bn-BD') : '.......................'}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* FORM 3: POST OPERATIVE ORDER */}
                {activePrintFormType === 'postop' && (
                  <div className="space-y-5 flex-1 text-xs">
                    
                    {/* Header Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="border border-slate-800 px-3 py-1 rounded text-center shrink-0">
                          <p className="text-[12px] font-bold tracking-widest text-indigo-900">DJ MH</p>
                          <div className="w-6 h-px bg-slate-800 mx-auto my-0.5"></div>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Hospital</span>
                        </div>
                        <div>
                          <h2 className="text-[23px] font-extrabold tracking-tight text-slate-950 font-serif">DR. JASIM MUKUL HOSPITAL</h2>
                          <p className="text-[12px] font-bold text-slate-700">V.I.P. Road, Galachipa, Patuakhali.</p>
                        </div>
                      </div>
                    </div>

                    {/* Post Op Title */}
                    <div className="text-center my-3">
                      <span className="text-[16px] font-extrabold px-8 py-1.5 border border-slate-800 rounded-md bg-slate-50 tracking-wider">
                        Post Operative Order
                      </span>
                    </div>

                    {/* Patient top banner fields */}
                    <div className="grid grid-cols-1 gap-2 border-b border-slate-200 pb-3">
                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Name of Patient :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientName}</div>
                        </div>
                        <div className="flex items-baseline w-[130px]">
                          <span className="font-bold">Cabin/bed:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.cabinWardBedNo}</div>
                        </div>
                        <div className="flex items-baseline w-[100px]">
                          <span className="font-bold">Sex:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientGender}</div>
                        </div>
                        <div className="flex items-baseline w-[110px]">
                          <span className="font-bold">Age:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientAge}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Regd. No :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-mono font-bold text-slate-900 px-2">{activePrintAdmission.regNo}</div>
                        </div>
                        <div className="flex items-baseline w-[250px]">
                          <span className="font-bold">Date :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">
                            {activePrintAdmission.opDate ? new Date(activePrintAdmission.opDate).toLocaleDateString('bn-BD') : '.......................'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columns layout */}
                    <div className="grid grid-cols-5 gap-6 mt-4">
                      
                      {/* Left Column (Operation Note) - Width 2/5 */}
                      <div className="col-span-2 border-r border-slate-300 pr-5 space-y-4">
                        <h4 className="font-bold border-b border-slate-900 pb-1 text-[13px] uppercase tracking-wide">Operation Note</h4>
                        
                        <div className="space-y-3.5 text-[11px] leading-relaxed">
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap">Date :</span>
                            <div className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold">{activePrintAdmission.opDate || '...................'}</div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold block">Indication :</span>
                            <div className="min-h-[40px] border-b border-dashed border-slate-400 font-bold whitespace-pre-wrap">{activePrintAdmission.opIndication || '...................'}</div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold block">Operation :</span>
                            <div className="min-h-[40px] border-b border-dashed border-slate-400 font-bold whitespace-pre-wrap">{activePrintAdmission.opName || '...................'}</div>
                          </div>

                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap">Anaesthesia :</span>
                            <div className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold">{activePrintAdmission.opAnaesthesia || '...................'}</div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold block">Outcome/Findings :</span>
                            <div className="min-h-[70px] border-b border-dashed border-slate-400 font-bold whitespace-pre-wrap">{activePrintAdmission.opOutcome || '...................'}</div>
                          </div>

                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap">Surgeon :</span>
                            <div className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold">{activePrintAdmission.opSurgeon || '...................'}</div>
                          </div>

                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap">Anaesthetist :</span>
                            <div className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold">{activePrintAdmission.opAnaesthetist || '...................'}</div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold block">Assistants :</span>
                            <div className="min-h-[35px] border-b border-dashed border-slate-400 font-bold whitespace-pre-wrap">{activePrintAdmission.opAssistants || '...................'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Rx Order List) - Width 3/5 */}
                      <div className="col-span-3 space-y-4">
                        <h4 className="font-bold border-b border-slate-900 pb-1 text-[13px] uppercase tracking-wide flex justify-between items-center">
                          <span>Rx</span>
                          <span className="text-[9px] text-slate-500 font-normal normal-case italic">Checked items will be highlighted</span>
                        </h4>

                        <div className="space-y-2 text-[10px] leading-relaxed">
                          {activePrintAdmission.rxItems?.map((rx, idx) => {
                            // Find the corresponding custom structure or label
                            return (
                              <div key={rx.id} className={`flex gap-2 items-start ${rx.checked ? 'text-slate-950 font-semibold' : 'text-slate-400 line-through opacity-40'}`}>
                                <div className="shrink-0 mt-0.5 font-mono text-[9px] w-4 border border-slate-300 text-center rounded bg-slate-50 flex items-center justify-center font-bold">
                                  {rx.checked ? '✓' : ''}
                                </div>
                                <div className="flex-1">
                                  <span className="font-bold">{idx + 1}. </span>
                                  {rx.id === 2 ? (
                                    <span>
                                      Inj. 5% DNS+5% DA (<span className="underline font-bold px-1">{rx.val1 || '1000 c.c'}</span>) total <span className="underline font-bold px-1">{rx.val1 || '1000 c.c'}</span> c.c.i.v. daily @ <span className="underline font-bold px-1">{rx.val3 || '30'}</span> drops/m.
                                    </span>
                                  ) : rx.id === 3 ? (
                                    <span>
                                      Inj. Ceftriaxone (<span className="underline font-bold px-1">{rx.val1 || 'Ceftron'}</span>) 1 gm i.v. 1 vial i.v. stat and daily/<span className="underline font-bold px-1">{rx.val2 || '12'}</span> hourly..
                                    </span>
                                  ) : (rx.id === 4 || rx.id === 5 || rx.id === 6) ? (
                                    <span>
                                      {rx.id === 4 ? 'Inj. Metronidazole' : rx.id === 5 ? 'Inj. Cephradin' : 'Inj. Ciprofloxacin'} (<span className="underline font-bold px-1">{rx.val1 || '500 mg'}</span>) 1 vial/bag i.v. stat and <span className="underline font-bold px-1">{rx.val2 || '8'}</span> hourly.
                                    </span>
                                  ) : (rx.id === 10 || rx.id === 11 || rx.id === 12) ? (
                                    <span>
                                      {rx.id === 10 ? 'Inj. Diclofenac Sodium' : rx.id === 11 ? 'Inj. Omeprazol' : 'Inj. Ketorolac'} (<span className="underline font-bold px-1">{rx.val1 || '40 mg'}</span>) 1 amp/vial stat & <span className="underline font-bold px-1">{rx.val2 || '12'}</span> hourly.
                                    </span>
                                  ) : rx.id === 13 ? (
                                    <span>
                                      Inj. Ergomentrin/Metherspan (<span className="underline font-bold px-1">{rx.val1 || 'Methergin'}</span>)
                                    </span>
                                  ) : (
                                    <span>{rx.id === 1 ? 'Nothing by mouth till F/O' : rx.id === 7 ? 'Inj. Pethedine-75/100mg i.m stat/Nulbun-2.' : rx.id === 8 ? 'Inj. Phenargan-1 am. i. v stat.' : rx.id === 9 ? 'Inj. Easium/Sedil-1 amp. 1 M.SOS and H/S daily.' : rx.id === 14 ? 'Observe P/v bleeding & check Pulse. B.P.& resp. hourly & inform E.M.O./A.R/ Consultant if necessary.' : rx.id === 15 ? 'Inj. Traxy / Xemic 1/2 amp.stat & 1/2 amp. 1 M 8 hourly.' : 'Inj. Linda-s/Ocin/pitocin 2 amp. in each 1000 c.c, fluid for 24 hours.'}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* FORM 4: DISCHARGE SUMMARY / ছাড়পত্র */}
                {activePrintFormType === 'discharge' && (
                  <div className="space-y-5 flex-1 text-xs">
                    
                    {/* Header Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="border border-slate-800 px-3 py-1 rounded text-center shrink-0">
                          <p className="text-[12px] font-bold tracking-widest text-indigo-900">DJ MH</p>
                          <div className="w-6 h-px bg-slate-800 mx-auto my-0.5"></div>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Hospital</span>
                        </div>
                        <div>
                          <h2 className="text-[23px] font-extrabold tracking-tight text-slate-950 font-serif">DR. JASIM MUKUL HOSPITAL</h2>
                          <p className="text-[12px] font-bold text-slate-700">V.I.P. Road, Galachipa, Patuakhali.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-900">রিলিজ ছাড়পত্র</p>
                        <p className="text-[9px] text-slate-500">Discharge Certificate</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-3">
                      <span className="text-[16px] font-extrabold px-8 py-1.5 border border-slate-800 rounded-md bg-slate-50 tracking-wider font-serif uppercase">
                        Discharge Summary / ছাড়পত্র
                      </span>
                    </div>

                    {/* Patient top banner fields */}
                    <div className="grid grid-cols-1 gap-2 border-b border-slate-200 pb-3">
                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Name of Patient :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientName}</div>
                        </div>
                        <div className="flex items-baseline w-[130px]">
                          <span className="font-bold">Cabin/bed:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.cabinWardBedNo}</div>
                        </div>
                        <div className="flex items-baseline w-[100px]">
                          <span className="font-bold">Sex:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientGender}</div>
                        </div>
                        <div className="flex items-baseline w-[110px]">
                          <span className="font-bold">Age:</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">{activePrintAdmission.patientAge}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Regd. No :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-mono font-bold text-slate-900 px-2">{activePrintAdmission.regNo}</div>
                        </div>
                        <div className="flex items-baseline w-[250px]">
                          <span className="font-bold">Contact No :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">
                            {activePrintAdmission.patientPhone || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Admission Date & Time :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2">
                            {activePrintAdmission.admissionDateTime ? new Date(activePrintAdmission.admissionDateTime).toLocaleString('bn-BD') : '.......................'}
                          </div>
                        </div>
                        <div className="flex items-baseline flex-1">
                          <span className="font-bold">Discharge Date & Time :</span>
                          <div className="flex-1 border-b border-dashed border-slate-800 ml-2 font-bold text-slate-900 px-2 text-amber-900 font-semibold">
                            {activePrintAdmission.dischargeDateTime ? new Date(activePrintAdmission.dischargeDateTime).toLocaleString('bn-BD') : '.......................'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columns layout */}
                    <div className="grid grid-cols-5 gap-6 mt-4">
                      
                      {/* Left Column (Admitting Doctor & Condition) - Width 2/5 */}
                      <div className="col-span-2 border-r border-slate-300 pr-5 space-y-4">
                        <div>
                          <h4 className="font-bold border-b border-slate-900 pb-1 text-[11px] uppercase tracking-wide">Admission Info</h4>
                          <div className="space-y-3.5 text-[11px] leading-relaxed mt-2.5">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-500 block">Admitting/Consultant Doctor :</span>
                              <div className="font-bold text-slate-900">{activePrintAdmission.doctorName || 'Dr. Jasim Mukul'}</div>
                            </div>
                            
                            {activePrintAdmission.opName && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-500 block">Operation Performed :</span>
                                <div className="font-bold text-slate-900">{activePrintAdmission.opName}</div>
                                {activePrintAdmission.opDate && <div className="text-[10px] text-slate-400">Date: {new Date(activePrintAdmission.opDate).toLocaleDateString('bn-BD')}</div>}
                              </div>
                            )}

                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-500 block">Condition on Discharge :</span>
                              <div className="font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-max text-center">
                                {activePrintAdmission.dischargeCondition || 'সুস্থ (Cured)'}
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-500 block">Follow-up Instructions :</span>
                              <div className="font-bold text-slate-800 whitespace-pre-wrap">{activePrintAdmission.followUpDate || '৭ দিন পর চেম্বারে যোগাযোগ করবেন।'}</div>
                            </div>
                          </div>
                        </div>

                        {/* General Advice */}
                        <div>
                          <h4 className="font-bold border-b border-slate-900 pb-1 text-[11px] uppercase tracking-wide">Advice on Discharge / উপদেশ</h4>
                          <div className="text-[11px] text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            {activePrintAdmission.dischargeAdvice || '১. নিয়মিত ঔষধ সেবন করবেন।\n২. কোনো জটিলতা হলে অবিলম্বে ডাক্তারের সাথে যোগাযোগ করবেন।'}
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Discharge Medications) - Width 3/5 */}
                      <div className="col-span-3 space-y-4">
                        <h4 className="font-bold border-b border-slate-900 pb-1 text-[11px] uppercase tracking-wide flex justify-between items-center">
                          <span>Medicines Prescribed at Discharge / ছুটির ঔষধসমূহ</span>
                          <span className="text-[9px] text-slate-500 font-normal">Rx</span>
                        </h4>

                        <div className="space-y-3">
                          {activePrintAdmission.dischargeMedicines && activePrintAdmission.dischargeMedicines.length > 0 ? (
                            activePrintAdmission.dischargeMedicines.map((med, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                <div className="shrink-0 mt-0.5 font-mono text-[10px] w-5 h-5 border border-slate-300 text-center rounded-full bg-white flex items-center justify-center font-bold text-slate-600">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 text-[11px]">
                                  <div className="font-bold text-slate-900">{med.name}</div>
                                  <div className="flex gap-4 text-[10px] text-slate-500 mt-0.5 font-semibold">
                                    <span>মাত্রা: <span className="font-bold text-amber-700">{med.dosage}</span></span>
                                    <span>নির্দেশনা: <span>{med.instruction}</span></span>
                                    <span>সময়কাল: <span className="text-slate-700">{med.duration}</span></span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-400 italic">
                              ছুটির সময় কোনো ঔষধের নাম উল্লেখ করা হয়নি।
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Signature block */}
                    <div className="flex justify-between pt-16 text-xs">
                      <div>
                        <div className="border-t border-slate-800 pt-1 w-40 text-center font-bold text-slate-700">
                          মেডিকেল অফিসার / স্টাফ
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-slate-800 pt-1 w-40 text-center font-bold text-slate-700">
                          কনসালটেন্ট স্বাক্ষর
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* FORM 5: DISCHARGE BILL MEMO / বিল মেমো */}
                {activePrintFormType === 'bill_memo' && (
                  <div className="space-y-5 flex-1 text-xs">
                    
                    {/* Header Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="border border-slate-800 px-3 py-1 rounded text-center shrink-0">
                          <p className="text-[12px] font-bold tracking-widest text-indigo-900">DJ MH</p>
                          <div className="w-6 h-px bg-slate-800 mx-auto my-0.5"></div>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Hospital</span>
                        </div>
                        <div>
                          <h2 className="text-[23px] font-extrabold tracking-tight text-slate-950 font-serif">DR. JASIM MUKUL HOSPITAL</h2>
                          <p className="text-[12px] font-bold text-slate-700">V.I.P. Road, Galachipa, Patuakhali.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-indigo-950">ডিসচার্জ বিল মেমো</p>
                        <p className="text-[9px] text-slate-500">Discharge Financial Bill</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-3">
                      <span className="text-[14px] font-extrabold px-8 py-1.5 border border-slate-800 rounded-md bg-slate-50 tracking-wider font-serif uppercase">
                        Discharge Bill Voucher / ফাইনাল ডিসচার্জ বিল
                      </span>
                    </div>

                    {/* Patient Details Table */}
                    <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200 w-[150px]">Patient Name / নাম:</td>
                          <td className="p-2 font-black text-slate-900 border-r border-slate-200">{activePrintAdmission.patientName}</td>
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200 w-[120px]">Cabin/Bed No:</td>
                          <td className="p-2 font-bold text-slate-900">{activePrintAdmission.cabinWardBedNo}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Reg No / রেজি নং:</td>
                          <td className="p-2 font-mono font-bold text-indigo-950 border-r border-slate-200">{activePrintAdmission.regNo}</td>
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Age / Gender:</td>
                          <td className="p-2 text-slate-800">{activePrintAdmission.patientAge} / {activePrintAdmission.patientGender}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Contact / মোবাইল:</td>
                          <td className="p-2 text-slate-800 border-r border-slate-200">{activePrintAdmission.patientPhone || 'N/A'}</td>
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Consultant:</td>
                          <td className="p-2 text-slate-800 font-bold">{activePrintAdmission.doctorName || 'Dr. Jasim Mukul'}</td>
                        </tr>
                        <tr>
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Admission Date:</td>
                          <td className="p-2 text-slate-800 border-r border-slate-200">
                            {activePrintAdmission.admissionDateTime ? new Date(activePrintAdmission.admissionDateTime).toLocaleString('bn-BD') : 'N/A'}
                          </td>
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Discharge Date:</td>
                          <td className="p-2 text-indigo-900 font-semibold">
                            {activePrintAdmission.dischargeDateTime ? new Date(activePrintAdmission.dischargeDateTime).toLocaleString('bn-BD') : 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Financial Bill Items Table */}
                    <div className="space-y-2 mt-4">
                      <h4 className="font-bold text-[12px] text-slate-900 border-b border-slate-400 pb-1 uppercase tracking-wide">
                        Bill Particulars & Details / বিলের বিবরণ ও হিসাব
                      </h4>
                      <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                            <th className="p-2.5 border-r border-slate-200 text-center w-12 font-bold">SL</th>
                            <th className="p-2.5 border-r border-slate-200 font-bold">Description of Services / সেবার বিবরণ</th>
                            <th className="p-2.5 border-r border-slate-200 text-right w-32 font-bold">Rate / হার (৳)</th>
                            <th className="p-2.5 border-r border-slate-200 text-center w-24 font-bold">Qty / Days</th>
                            <th className="p-2.5 text-right w-36 font-bold">Total Amount / মোট (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* 1. Bed/Cabin Charge */}
                          <tr>
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                            <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Bed / Cabin / Ward Charge (কেবিন/বেড ভাড়া)</td>
                            <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeCabinCharge || 0).toLocaleString('bn-BD')}</td>
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono">{activePrintAdmission.dischargeCabinDays || 1} Days</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {((activePrintAdmission.dischargeCabinCharge || 0) * (activePrintAdmission.dischargeCabinDays || 1)).toLocaleString('bn-BD')}</td>
                          </tr>

                          {/* 2. Doctor Round Fee */}
                          <tr>
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono">2</td>
                            <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Doctor's Visit & Round Fees (ডাক্তার রাউন্ড ভিজিট ফি)</td>
                            <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeDoctorFee || 0).toLocaleString('bn-BD')}</td>
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeDoctorFee || 0).toLocaleString('bn-BD')}</td>
                          </tr>

                          {/* 3. Surgeon/Operation Fee */}
                          {activePrintAdmission.dischargeOpFee > 0 && (
                            <tr>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">3</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Operation / Surgeon Charges (অপারেশন ও সার্জন ফি)</td>
                              <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeOpFee || 0).toLocaleString('bn-BD')}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeOpFee || 0).toLocaleString('bn-BD')}</td>
                            </tr>
                          )}

                          {/* 4. OT Charge */}
                          {activePrintAdmission.dischargeOtCharge > 0 && (
                            <tr>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">4</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Operation Theatre (OT) Charge (ওটি চার্জ)</td>
                              <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeOtCharge || 0).toLocaleString('bn-BD')}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeOtCharge || 0).toLocaleString('bn-BD')}</td>
                            </tr>
                          )}

                          {/* 5. Anaesthetist Fee */}
                          {activePrintAdmission.dischargeAnaesthetistFee > 0 && (
                            <tr>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">5</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Anaesthetist Fee (অ্যানেসথেটিস্ট ফি)</td>
                              <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeAnaesthetistFee || 0).toLocaleString('bn-BD')}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeAnaesthetistFee || 0).toLocaleString('bn-BD')}</td>
                            </tr>
                          )}

                          {/* 6. Medicine Charge */}
                          {activePrintAdmission.dischargeMedicineCharge > 0 && (
                            <tr>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">6</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Hospital Pharmacy Medicines & Consumables (ঔষধ ও সরঞ্জামাদি)</td>
                              <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeMedicineCharge || 0).toLocaleString('bn-BD')}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeMedicineCharge || 0).toLocaleString('bn-BD')}</td>
                            </tr>
                          )}

                          {/* 7. Other Service Charges */}
                          {activePrintAdmission.dischargeOtherCharge > 0 && (
                            <tr>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">7</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">Other Diagnostics / General Nursing Service Charges (অন্যান্য চার্জ)</td>
                              <td className="p-2.5 border-r border-slate-200 text-right font-mono">৳ {(activePrintAdmission.dischargeOtherCharge || 0).toLocaleString('bn-BD')}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-mono">1</td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeOtherCharge || 0).toLocaleString('bn-BD')}</td>
                            </tr>
                          )}

                          {/* Subtotals & Net Summary */}
                          <tr className="bg-slate-50 border-t-2 border-slate-300">
                            <td colSpan={3} className="p-2 text-right font-bold border-r border-slate-200">Gross Subtotal / উপ-মোট বিল পরিমাণ:</td>
                            <td colSpan={2} className="p-2 text-right font-mono font-bold text-slate-900">৳ {(activePrintAdmission.dischargeBillSubtotal || 0).toLocaleString('bn-BD')}</td>
                          </tr>
                          <tr className="bg-amber-50/50">
                            <td colSpan={3} className="p-2 text-right font-bold text-amber-900 border-r border-slate-200">Discount Offered (-) / প্রাপ্ত বিশেষ ছাড়:</td>
                            <td colSpan={2} className="p-2 text-right font-mono font-bold text-amber-800">৳ {(activePrintAdmission.dischargeBillDiscount || 0).toLocaleString('bn-BD')}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={3} className="p-2 text-right font-extrabold border-r border-slate-200 text-emerald-950">Net Total Bill / সর্বমোট পরিশোধযোগ্য বিল:</td>
                            <td colSpan={2} className="p-2 text-right font-mono font-black text-emerald-900 text-xs">৳ {(activePrintAdmission.dischargeBillTotal || 0).toLocaleString('bn-BD')}</td>
                          </tr>
                          <tr className="bg-indigo-50/50">
                            <td colSpan={3} className="p-2 text-right font-bold text-indigo-950 border-r border-slate-200">Total Cash Paid / পরিশোধিত নগদ টাকা:</td>
                            <td colSpan={2} className="p-2 text-right font-mono font-bold text-indigo-900">৳ {(activePrintAdmission.dischargeBillPaid || 0).toLocaleString('bn-BD')}</td>
                          </tr>
                          <tr className="bg-rose-50 border-t border-slate-200 text-xs font-black">
                            <td colSpan={3} className="p-2.5 text-right text-rose-950 border-r border-slate-200">Outstanding Net Due / বকেয়া অবশিষ্টাংশ:</td>
                            <td colSpan={2} className="p-2.5 text-right font-mono text-rose-700 text-xs">৳ {(activePrintAdmission.dischargeBillDue || 0).toLocaleString('bn-BD')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Bill Footer Notes */}
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] text-slate-600 leading-normal mt-2">
                      <span className="font-extrabold text-slate-800 uppercase tracking-wider block mb-0.5">Payment Terms & Instructions / বিল পরিশোধের শর্তাবলী:</span>
                      ১. এই বিলটি হাসপাতাল রিলিজের সময়ে পেমেন্ট চেকআউট পয়েন্টে নগদে কিংবা ব্যাংকিং চ্যানেলে নিষ্পত্তি সাপেক্ষে কপি ছাড় করা হয়েছে।
                      ২. কোনো ধরনের অসঙ্গতি বা প্রশ্নের জন্য তাৎক্ষণিক কাউন্টারে মেমোটিসহ যোগাযোগ করুন।
                    </div>

                    {/* Signature block */}
                    <div className="flex justify-between pt-16 text-xs">
                      <div>
                        <div className="border-t border-slate-800 pt-1 w-40 text-center font-bold text-slate-700">
                          ক্যাশিয়ার / হিসাবরক্ষক
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-slate-800 pt-1 w-40 text-center font-bold text-slate-700">
                          কর্তৃপক্ষের স্বাক্ষর
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Patient Discharge Modal */}
      {isDischargeModalOpen && dischargeTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">রোগীর ছাড়পত্র ও ডিসচার্জ ফর্ম</h3>
                <p className="text-xs text-slate-500 font-medium">{dischargeTarget.patientName} | রেজিঃ নং: {dischargeTarget.regNo} | কেবিন: {dischargeTarget.cabinWardBedNo}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseDischargeModal}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleDischargeSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Discharge Date & Time */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">ডিসচার্জের তারিখ ও সময়</label>
                  <input
                    type="datetime-local"
                    value={dischargeDateTime}
                    onChange={(e) => setDischargeDateTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                {/* Discharge Condition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">রিলিজের সময় রোগীর অবস্থা</label>
                  <select
                    value={dischargeCondition}
                    onChange={(e) => setDischargeCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500 text-slate-800"
                  >
                    <option value="সুস্থ (Cured)">সুস্থ (Cured / Recovered)</option>
                    <option value="উন্নত (Improved)">উন্নত (Improved)</option>
                    <option value="রেফারড (Referred)">উন্নত চিকিৎসার জন্য রেফারড (Referred)</option>
                    <option value="স্বেচ্ছায় রিলিজ (DOR)">স্বেচ্ছায় রিলিজ (Discharged on Request / LAMA)</option>
                    <option value="মৃত্যু (Death)">মৃত্যু (Death)</option>
                  </select>
                </div>

              </div>

              {/* Medicines at Discharge */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-700 tracking-tight flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  ছুটির সময়ে বাড়িতে সেবনের জন্য ঔষধপত্র (Discharge Rx)
                </h4>

                {/* Medicine Quick Adder Form */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="ঔষধের নাম (যেমন: Tab. Cefradin 500mg)"
                      value={tempDischargeMedName}
                      onChange={(e) => setTempDischargeMedName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="সেবন মাত্রা (যেমন: ১+০+১)"
                      value={tempDischargeMedDosage}
                      onChange={(e) => setTempDischargeMedDosage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <select
                      value={tempDischargeMedInstruction}
                      onChange={(e) => setTempDischargeMedInstruction(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                    >
                      <option value="খাবারের পর">খাবারের পর</option>
                      <option value="খাবারের আগে">খাবারের আগে</option>
                      <option value="ভরা পেটে">ভরা পেটে</option>
                      <option value="খাবার সাথে">খাবার সাথে</option>
                      <option value="প্রয়োজন হলে">প্রয়োজন হলে</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="কতদিন খাবে (যেমন: ৭ দিন)"
                      value={tempDischargeMedDuration}
                      onChange={(e) => setTempDischargeMedDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDischargeMedicine}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                  >
                    যুক্ত করুন
                  </button>
                </div>

                {/* List of Added Discharge Medicines */}
                {dischargeMedicines.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-bold uppercase text-slate-400">
                          <th className="py-2 px-3">ঔষধের নাম</th>
                          <th className="py-2 px-3">সেবন মাত্রা</th>
                          <th className="py-2 px-3">নির্দেশনা</th>
                          <th className="py-2 px-3">মেয়াদ</th>
                          <th className="py-2 px-3 text-right">মুছুন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-[11px]">
                        {dischargeMedicines.map((med, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-3 font-bold text-slate-800">{med.name}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-amber-700">{med.dosage}</td>
                            <td className="py-1.5 px-3 text-slate-500">{med.instruction}</td>
                            <td className="py-1.5 px-3 font-medium text-slate-600">{med.duration}</td>
                            <td className="py-1.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveDischargeMedicine(index)}
                                className="text-rose-500 hover:text-rose-700 font-bold px-1"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">কোনো ঔষধ যোগ করা হয়নি। বাড়িতে সেবনের জন্য কোনো ঔষধ থাকলে তা ওপরে যোগ করুন।</p>
                )}
              </div>

              {/* General Advice */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">ছাড়পত্রের পরামর্শ ও উপদেশ (Advice on Discharge)</label>
                <textarea
                  rows={3}
                  value={dischargeAdvice}
                  onChange={(e) => setDischargeAdvice(e.target.value)}
                  placeholder="যেমন: ১. ৭ দিন পর এসে সেলাই কাটবেন। ২. প্রচুর তরল খাবার খাবেন।"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              {/* Follow up Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">পরবর্তী সাক্ষাতের সময় (Follow-up Guidelines)</label>
                <input
                  type="text"
                  value={dischargeFollowUp}
                  onChange={(e) => setDischargeFollowUp(e.target.value)}
                  placeholder="যেমন: ৭ দিন পর / আগামী রবিবার সকাল ১০ টায়"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              {/* Discharge Bill Inputs Section */}
              <div className="border-t border-slate-200 pt-4 space-y-3.5">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  ডিসচার্জ রিলিজ বিল মেমো ও হিসাব (Discharge Bill Voucher)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  {/* Cabin Charge Rate */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">কেবিন/বেড ভাড়া (দৈনিক)</label>
                    <input
                      type="number"
                      value={dischargeCabinCharge || ''}
                      onChange={(e) => setDischargeCabinCharge(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ১০০০"
                    />
                  </div>

                  {/* Cabin Stay Days */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">দিনের সংখ্যা (দিন)</label>
                    <input
                      type="number"
                      value={dischargeCabinDays || ''}
                      onChange={(e) => setDischargeCabinDays(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ৫"
                    />
                  </div>

                  {/* Doctor Round Fee */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">ডাক্তার রাউন্ড ফি</label>
                    <input
                      type="number"
                      value={dischargeDoctorFee || ''}
                      onChange={(e) => setDischargeDoctorFee(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ১৫০০"
                    />
                  </div>

                  {/* Surgeon/Operation Fee */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">অপারেশন/সার্জন ফি</label>
                    <input
                      type="number"
                      value={dischargeOpFee || ''}
                      onChange={(e) => setDischargeOpFee(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ১০০০০"
                    />
                  </div>

                  {/* OT Charge */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">ওটি চার্জ (OT Charge)</label>
                    <input
                      type="number"
                      value={dischargeOtCharge || ''}
                      onChange={(e) => setDischargeOtCharge(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ৫০০০"
                    />
                  </div>

                  {/* Anaesthetist Fee */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">অ্যানেসথেটিস্ট ফি</label>
                    <input
                      type="number"
                      value={dischargeAnaesthetistFee || ''}
                      onChange={(e) => setDischargeAnaesthetistFee(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ৩০০০"
                    />
                  </div>

                  {/* Medicine Charge */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">ঔষধ ও সরঞ্জামাদি বিল</label>
                    <input
                      type="number"
                      value={dischargeMedicineCharge || ''}
                      onChange={(e) => setDischargeMedicineCharge(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ৪০০০"
                    />
                  </div>

                  {/* Other Service Charges */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">অন্যান্য সার্ভিস চার্জ</label>
                    <input
                      type="number"
                      value={dischargeOtherCharge || ''}
                      onChange={(e) => setDischargeOtherCharge(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="যেমন: ৫০০"
                    />
                  </div>
                </div>

                {/* Subtotals & Payments Breakdown */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] items-center">
                  <div className="font-bold text-slate-700">
                    মোট উপ-বিল: <span className="font-mono text-xs font-black text-slate-900 block mt-0.5">৳ {((dischargeCabinCharge * dischargeCabinDays) + dischargeDoctorFee + dischargeOpFee + dischargeOtCharge + dischargeAnaesthetistFee + dischargeMedicineCharge + dischargeOtherCharge).toLocaleString('bn-BD')}</span>
                  </div>

                  {/* Discount input */}
                  <div className="space-y-0.5">
                    <label className="block font-bold text-amber-800">ছাড়/ডিসকাউন্ট (৳)</label>
                    <input
                      type="number"
                      value={dischargeBillDiscount || ''}
                      onChange={(e) => setDischargeBillDiscount(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-amber-700 text-xs"
                      placeholder="০"
                    />
                  </div>

                  {/* Total Bill display */}
                  <div className="font-bold text-emerald-800">
                    নীট বিল পরিমাণ: <span className="font-mono text-xs font-black text-emerald-950 block mt-0.5">৳ {Math.max(0, ((dischargeCabinCharge * dischargeCabinDays) + dischargeDoctorFee + dischargeOpFee + dischargeOtCharge + dischargeAnaesthetistFee + dischargeMedicineCharge + dischargeOtherCharge) - dischargeBillDiscount).toLocaleString('bn-BD')}</span>
                  </div>

                  {/* Paid amount input */}
                  <div className="space-y-0.5">
                    <label className="block font-bold text-indigo-800">পরিশোধিত টাকা (৳)</label>
                    <input
                      type="number"
                      value={dischargeBillPaid || ''}
                      onChange={(e) => setDischargeBillPaid(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-indigo-700 text-xs"
                      placeholder="০"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseDischargeModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  ছুটি নিশ্চিত করুন (Discharge)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
