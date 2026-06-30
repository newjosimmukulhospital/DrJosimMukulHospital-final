import React, { useState } from 'react';
import { Prescription, Patient } from '../types';
import { Clipboard, Plus, Trash2, Printer, Sparkles, AlertTriangle, Stethoscope, Heart, Activity, FileText } from 'lucide-react';
import { DOCTORS, HOSPITAL_INFO, getDoctors, addCustomDoctor } from '../data/doctors';

interface PrescriptionGeneratorProps {
  prescriptions: Prescription[];
  patients: Patient[];
  onAddPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => void;
  selectedPatientFromDirectAction: Patient | null;
  clearDirectPatient: () => void;
}

export default function PrescriptionGenerator({
  prescriptions,
  patients,
  onAddPrescription,
  selectedPatientFromDirectAction,
  clearDirectPatient,
}: PrescriptionGeneratorProps) {
  // Main states
  const [patientId, setPatientId] = useState(selectedPatientFromDirectAction?.id || '');
  const [doctorsList, setDoctorsList] = useState(getDoctors());
  const [doctorId, setDoctorId] = useState(getDoctors()[0].id);

  // Custom doctor states
  const [showAddCustomDoctor, setShowAddCustomDoctor] = useState(false);
  const [customDoctorName, setCustomDoctorName] = useState('');
  const [customDoctorDegrees, setCustomDoctorDegrees] = useState('');
  const [customDoctorSpecialty, setCustomDoctorSpecialty] = useState('');
  const [customDoctorDesignation, setCustomDoctorDesignation] = useState('');
  const [customDoctorBmdc, setCustomDoctorBmdc] = useState('');

  const handleAddCustomDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDoctorName || !customDoctorDegrees) {
      alert("Doctor's name and degrees are required.");
      return;
    }
    const added = addCustomDoctor({
      nameBn: customDoctorName,
      nameEn: customDoctorName,
      degreesBn: customDoctorDegrees,
      degreesEn: customDoctorDegrees,
      specialtyBn: customDoctorSpecialty || 'General Practitioner',
      specialtyEn: customDoctorSpecialty || 'General Practitioner',
      designationBn: customDoctorDesignation,
      designationEn: customDoctorDesignation,
      bmdcBn: customDoctorBmdc,
      bmdcEn: customDoctorBmdc,
      chamberBn: 'All days',
      chamberEn: 'All days',
    });
    if (added) {
      const updatedList = getDoctors();
      setDoctorsList(updatedList);
      setDoctorId(added.id);
      // Reset
      setCustomDoctorName('');
      setCustomDoctorDegrees('');
      setCustomDoctorSpecialty('');
      setCustomDoctorDesignation('');
      setCustomDoctorBmdc('');
      setShowAddCustomDoctor(false);
    }
  };
  
  // Vitals
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [pulse, setPulse] = useState('');
  
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  
  // Medicines list
  const [medicines, setMedicines] = useState<{
    name: string;
    dosage: string;
    instruction: string;
    duration: string;
  }[]>([]);

  // Temp input for individual medicine
  const [tempMedName, setTempMedName] = useState('');
  const [tempMedDosage, setTempMedDosage] = useState('1+0+1');
  const [tempMedInstruction, setTempMedInstruction] = useState('After meals');
  const [tempMedDuration, setTempMedDuration] = useState('7 days');

  // AI loading and error states
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Triage / Symptom checker state
  const [triageSymptoms, setTriageSymptoms] = useState('');
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    causes: string[];
    recommendedTestsAndSpecialists: string;
    warningSigns: string[];
    disclaimer: string;
  } | null>(null);

  // Selected prescription to show Rx template
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);

  React.useEffect(() => {
    if (selectedPatientFromDirectAction) {
      setPatientId(selectedPatientFromDirectAction.id);
      // Auto populate symptoms from patient record
      if (selectedPatientFromDirectAction.initialComplaint) {
        setSymptoms(selectedPatientFromDirectAction.initialComplaint);
      }
    }
  }, [selectedPatientFromDirectAction]);

  // AI Generation API call
  const handleAiGenerate = async () => {
    if (!symptoms && !diagnosis) {
      alert('Please type major symptoms or diagnosis so AI can determine correct medicines.');
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/generate-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          diagnosis,
          vitals: { bp, temp, weight, pulse }
        }),
      });

      if (!res.ok) {
        throw new Error('AI Prescription Generator failed. Please try again.');
      }

      const data = await res.json();
      if (data.medicines && Array.isArray(data.medicines)) {
        setMedicines(data.medicines);
      }
      if (data.advice) {
        setAdvice(data.advice);
      }
    } catch (err: any) {
      console.error(err);
      setAiError('AI prescription generation failed. Please add medicines manually.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Symptom Triage Analysis API call
  const handleTriageAnalyze = async () => {
    if (!triageSymptoms.trim()) return;
    setIsTriageLoading(true);
    setTriageResult(null);

    try {
      const res = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: triageSymptoms }),
      });

      if (!res.ok) {
        throw new Error('Symptom triage analysis failed');
      }

      const data = await res.json();
      setTriageResult(data);
    } catch (err: any) {
      console.error(err);
      alert('Symptom analysis failed.');
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleAddMedicine = () => {
    if (!tempMedName.trim()) return;
    setMedicines(prev => [...prev, {
      name: tempMedName.trim(),
      dosage: tempMedDosage,
      instruction: tempMedInstruction,
      duration: tempMedDuration
    }]);
    setTempMedName('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Please select a patient.');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const selectedDoc = doctorsList.find(d => d.id === doctorId) || doctorsList[0];

    onAddPrescription({
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender === 'Male' ? 'Male' : patient.gender === 'Female' ? 'Female' : 'Others',
      vitals: { bp, temp, weight, pulse },
      symptoms,
      diagnosis,
      medicines,
      advice,
      doctorName: selectedDoc.nameEn,
      doctorDegrees: selectedDoc.degreesEn,
      doctorSpecialty: selectedDoc.specialtyEn,
      doctorDesignation: selectedDoc.designationEn,
      doctorBmdc: selectedDoc.bmdcEn,
    });

    // Reset Form
    setPatientId('');
    setBp('');
    setTemp('');
    setWeight('');
    setPulse('');
    setSymptoms('');
    setDiagnosis('');
    setMedicines([]);
    setAdvice('');
    clearDirectPatient();
    alert('Prescription successfully saved!');
  };

  return (
    <div className="space-y-6" id="prescription-generator-section">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Smart Prescription Writer (AI Smart Rx Writer)
            </h2>
            <p className="text-xs text-slate-500 mt-1">Input patient vitals and generate prescriptions with AI in one click.</p>
          </div>

          <form onSubmit={handleSavePrescription} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Patient & Doctor */}
              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient *</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Select Prescribing Doctor *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomDoctor(!showAddCustomDoctor)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Custom Doctor
                    </button>
                  </div>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    {doctorsList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nameEn} - {d.degreesEn}
                      </option>
                    ))}
                  </select>
                </div>

                {showAddCustomDoctor && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" /> Add New Custom Doctor
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Doctor's Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Md. Anisur Rahman"
                          value={customDoctorName}
                          onChange={(e) => setCustomDoctorName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Degrees *</label>
                        <input
                          type="text"
                          placeholder="e.g. MBBS, FCPS (Medicine)"
                          value={customDoctorDegrees}
                          onChange={(e) => setCustomDoctorDegrees(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Specialty</label>
                        <input
                          type="text"
                          placeholder="e.g. Medicine Specialist"
                          value={customDoctorSpecialty}
                          onChange={(e) => setCustomDoctorSpecialty(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Designation & Hospital</label>
                        <input
                          type="text"
                          placeholder="e.g. Consultant, Barishal Medical College"
                          value={customDoctorDesignation}
                          onChange={(e) => setCustomDoctorDesignation(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">BMDC Reg No.</label>
                        <input
                          type="text"
                          placeholder="e.g. BMDC Reg No: A-12345"
                          value={customDoctorBmdc}
                          onChange={(e) => setCustomDoctorBmdc(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomDoctor(false)}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomDoctorSubmit}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Save Doctor
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Vitals inputs */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-4 border-b border-slate-200 pb-1.5 mb-1">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    Patient Vitals:
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Blood Pressure (BP):</label>
                  <input
                    type="text"
                    placeholder="e.g. 120/80"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Temperature (°F):</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.6"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Weight (KG):</label>
                  <input
                    type="text"
                    placeholder="e.g. 72"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pulse Rate (Pulse):</label>
                  <input
                    type="text"
                    placeholder="e.g. 78"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Symptoms & Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chief Complaints (Symptoms):</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe chief complaints or symptoms..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diagnosis:</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Fever, Gastritis"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* AI prescription button triggers */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                {isAiGenerating ? 'AI analyzing medicines...' : 'Generate Medicine Suggestions with AI'}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded border border-red-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {aiError}
              </p>
            )}

            {/* Medicines List Creator */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">Medications (Medication Table)</span>
              
              {/* Dynamic list */}
              <div className="space-y-2">
                {medicines.map((med, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="grid grid-cols-4 gap-2 flex-1 text-xs font-semibold text-slate-700">
                      <div className="col-span-2 font-bold text-slate-800">{med.name}</div>
                      <div>{med.dosage}</div>
                      <div className="text-slate-500">{med.instruction} ({med.duration})</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Medicine Manual Input row */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Medicine Name (e.g. Tab. Napa Extra 500mg)</label>
                  <input
                    type="text"
                    value={tempMedName}
                    onChange={(e) => setTempMedName(e.target.value)}
                    placeholder="Enter medicine name"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage (e.g. 1+0+1)</label>
                  <input
                    type="text"
                    value={tempMedDosage}
                    onChange={(e) => setTempMedDosage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Instruction & Duration</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={tempMedInstruction}
                      onChange={(e) => setTempMedInstruction(e.target.value)}
                      placeholder="After meals"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={tempMedDuration}
                      onChange={(e) => setTempMedDuration(e.target.value)}
                      placeholder="7 days"
                      className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medicine
                </button>
              </div>
            </div>

            {/* Advice area */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Advice & Instructions (Medical Advice):</label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Drink plenty of water, avoid smoking, consult if symptoms persist..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Print & Save Prescription
              </button>
            </div>
          </form>
        </div>

        {/* AI Symptom checker / triage sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              AI Symptom Triage Analyzer
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Type the patient's symptoms below. AI will provide potential causes, recommended specialists, and diagnostic tests needed.
            </p>

            <div className="space-y-3">
              <textarea
                value={triageSymptoms}
                onChange={(e) => setTriageSymptoms(e.target.value)}
                placeholder="e.g. Severe fever for 3 days, headache, and joint pain."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
              
              <button
                type="button"
                onClick={handleTriageAnalyze}
                disabled={isTriageLoading || !triageSymptoms.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isTriageLoading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
            </div>

            {triageResult && (
              <div className="space-y-3 pt-3 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="font-bold text-slate-700 block">Potential Causes:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 mt-1">
                    {triageResult.causes.map((cause, i) => <li key={i}>{cause}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block">Recommended Tests & Specialists:</span>
                  <p className="text-slate-600 mt-0.5">{triageResult.recommendedTestsAndSpecialists}</p>
                </div>

                {triageResult.warningSigns && triageResult.warningSigns.length > 0 && (
                  <div className="bg-red-50 border border-red-100 p-2.5 rounded-lg text-red-700">
                    <span className="font-bold text-red-800 block mb-1">Warning Signs:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {triageResult.warningSigns.map((sign, i) => <li key={i}>{sign}</li>)}
                    </ul>
                  </div>
                )}
                
                <span className="block text-[9px] text-slate-400 italic font-medium leading-relaxed mt-2">
                  * {triageResult.disclaimer || 'Not a substitute for professional medical advice. Consult a doctor.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription history / list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-500" />
          Saved Prescriptions
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-100 text-xs text-slate-600">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Prescription ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age & Gender</th>
                <th className="py-3 px-4">Symptoms</th>
                <th className="py-3 px-4">No. of Medicines</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No saved prescriptions found.
                  </td>
                </tr>
              ) : (
                prescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{pres.id.substring(0, 6)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{pres.patientName}</td>
                    <td className="py-3 px-4">{pres.patientAge} years ({pres.patientGender})</td>
                    <td className="py-3 px-4 max-w-[180px] truncate">{pres.symptoms || 'None'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {pres.medicines.length} Medicine(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewPrescription(pres)}
                        className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        View Rx
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription View Modal (Standard Rx Layout) */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto" id="rx-template-print">
            
            {/* Header / Doctor letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5 mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-serif tracking-tight">{HOSPITAL_INFO.nameEn}</h3>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-[280px]">{HOSPITAL_INFO.addressEn}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Phone: {HOSPITAL_INFO.phone}</p>
              </div>
              <div className="text-right max-w-[320px]">
                <h4 className="text-sm font-extrabold text-slate-900">{viewPrescription.doctorName || 'Dr. Md. Jasim Uddin (Mukul)'}</h4>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">{viewPrescription.doctorDegrees || 'MBBS (Dhaka)'}</p>
                <p className="text-[10px] text-slate-500">{viewPrescription.doctorSpecialty || 'Experienced in Gynecology & Obstetrics, Surgeon and Sonologist'}</p>
                {viewPrescription.doctorDesignation && (
                  <p className="text-[9px] text-slate-400 leading-tight mt-1">
                    {viewPrescription.doctorDesignation}
                  </p>
                )}
                {viewPrescription.doctorBmdc && (
                  <p className="text-[9px] text-slate-500 font-mono font-medium mt-0.5">
                    {viewPrescription.doctorBmdc}
                  </p>
                )}
              </div>
            </div>

            {/* Patient Header Details info row */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div>
                <span className="text-slate-500">Patient Name:</span>
                <p className="font-bold text-slate-800">{viewPrescription.patientName}</p>
              </div>
              <div>
                <span className="text-slate-500">Age & Gender:</span>
                <p className="font-semibold text-slate-800">{viewPrescription.patientAge} years | {viewPrescription.patientGender}</p>
              </div>
              <div>
                <span className="text-slate-500">Date:</span>
                <p className="font-semibold text-slate-800">{viewPrescription.createdAt.split('T')[0]}</p>
              </div>
              <div>
                <span className="text-slate-500">ID:</span>
                <p className="font-mono text-slate-700 font-semibold">#{viewPrescription.id.substring(0, 6)}</p>
              </div>
            </div>

            {/* Main Prescribing Area Split Column (Vitals/Symptoms on left, Rx on right) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 min-h-[300px]">
              
              {/* Left Column: Vitals, Complaints */}
              <div className="border-r border-slate-200 pr-5 space-y-4 text-xs">
                {/* Vitals */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Vitals:</span>
                  <div className="space-y-1.5 text-slate-600">
                    {viewPrescription.vitals.bp && <p>• Blood Pressure (BP): <span className="font-bold text-slate-700">{viewPrescription.vitals.bp}</span></p>}
                    {viewPrescription.vitals.temp && <p>• Temperature: <span className="font-bold text-slate-700">{viewPrescription.vitals.temp} °F</span></p>}
                    {viewPrescription.vitals.weight && <p>• Weight: <span className="font-bold text-slate-700">{viewPrescription.vitals.weight} KG</span></p>}
                    {viewPrescription.vitals.pulse && <p>• Pulse Rate: <span className="font-bold text-slate-700">{viewPrescription.vitals.pulse}/Min</span></p>}
                  </div>
                </div>

                {/* Symptoms */}
                {viewPrescription.symptoms && (
                  <div className="space-y-1 pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Complaints (CC):</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{viewPrescription.symptoms}</p>
                  </div>
                )}

                {/* Diagnosis */}
                {viewPrescription.diagnosis && (
                  <div className="space-y-1 pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Diagnosis:</span>
                    <p className="text-blue-700 font-bold whitespace-pre-line">{viewPrescription.diagnosis}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Rx symbol and Medications list */}
              <div className="sm:col-span-2 space-y-4 pl-1">
                <span className="text-2xl font-extrabold text-blue-600 italic block">Rx</span>

                <div className="space-y-3 text-xs">
                  {viewPrescription.medicines.length === 0 ? (
                    <p className="text-slate-400 italic">No medicine prescribed.</p>
                  ) : (
                    viewPrescription.medicines.map((med, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-800 text-sm">
                          <span>{i + 1}. {med.name}</span>
                          <span className="text-blue-600 font-mono text-xs">{med.dosage}</span>
                        </div>
                        <div className="text-slate-500 pl-4 flex gap-3 text-[11px]">
                          <span>• {med.instruction}</span>
                          <span>• {med.duration}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Advice summary */}
                {viewPrescription.advice && (
                  <div className="border-t border-slate-200 pt-4 mt-6">
                    <span className="font-bold text-slate-700 text-xs block mb-1">Advice:</span>
                    <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{viewPrescription.advice}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor's Signature space */}
            <div className="flex justify-end pt-12 border-t border-slate-200 mt-10">
              <div className="text-center w-48 text-xs border-t border-slate-300 pt-1 text-slate-500">
                Doctor's Signature
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Printer className="w-4 h-4" />
                Print Prescription
              </button>
              <button
                onClick={() => setViewPrescription(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
