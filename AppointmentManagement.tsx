import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { Calendar, UserCheck, Plus, Check, X, Clock, MapPin, Printer } from 'lucide-react';
import { DOCTORS, getDoctors, addCustomDoctor } from '../data/doctors';

interface AppointmentManagementProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'serialNo'>) => void;
  onUpdateStatus: (id: string, status: 'Pending' | 'Completed' | 'Cancelled') => void;
  selectedPatientFromDirectAction: Patient | null;
  clearDirectPatient: () => void;
}

export default function AppointmentManagement({
  appointments,
  patients,
  onAddAppointment,
  onUpdateStatus,
  selectedPatientFromDirectAction,
  clearDirectPatient,
}: AppointmentManagementProps) {
  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(selectedPatientFromDirectAction !== null);
  const [patientId, setPatientId] = useState(selectedPatientFromDirectAction?.id || '');
  const [doctorsList, setDoctorsList] = useState(getDoctors());
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');

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
      alert('Doctor name and degrees are required.');
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
      // Select the newly added doctor
      const idx = updatedList.findIndex(d => d.id === added.id);
      if (idx !== -1) {
        setDoctorIndex(idx);
      }
      // Reset
      setCustomDoctorName('');
      setCustomDoctorDegrees('');
      setCustomDoctorSpecialty('');
      setCustomDoctorDesignation('');
      setCustomDoctorBmdc('');
      setShowAddCustomDoctor(false);
    }
  };

  // Print slip state
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null);

  React.useEffect(() => {
    if (selectedPatientFromDirectAction) {
      setPatientId(selectedPatientFromDirectAction.id);
      setIsFormOpen(true);
    }
  }, [selectedPatientFromDirectAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Please select a patient.');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    onAddAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorName: doctorsList[doctorIndex]?.nameEn || DOCTORS[0].nameEn,
      specialty: doctorsList[doctorIndex]?.specialtyEn || DOCTORS[0].specialtyEn,
      date,
      time,
      status: 'Pending',
    });

    setIsFormOpen(false);
    clearDirectPatient();
    setPatientId('');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    clearDirectPatient();
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesDate = filterDate ? app.date === filterDate : true;
    const matchesDoctor = filterDoctor ? app.doctorName === filterDoctor : true;
    return matchesDate && matchesDoctor;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="appointment-management-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Doctor Schedule & Appointments (Doctor Appointment Queue)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage daily doctor visits, serial slips, and appointments booking.</p>
        </div>

        <button
          onClick={() => {
            setPatientId('');
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Appointment Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Doctor Appointment Serial Booking
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">If patient is not registered, add them first from the "Patient Registration" tab.</p>
              </div>

               <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Select Doctor *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomDoctor(!showAddCustomDoctor)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Custom Doctor
                  </button>
                </div>
                <select
                  value={doctorIndex}
                  onChange={(e) => setDoctorIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                >
                  {doctorsList.map((doc, idx) => (
                    <option key={idx} value={idx}>
                      {doc.nameEn} - {doc.degreesEn}
                    </option>
                  ))}
                </select>
              </div>

              {showAddCustomDoctor && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    Add Custom Doctor
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Doctor Name (English) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Md. Anisur Rahman"
                        value={customDoctorName}
                        onChange={(e) => setCustomDoctorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Degrees (English) *</label>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, FCPS (Medicine)"
                        value={customDoctorDegrees}
                        onChange={(e) => setCustomDoctorDegrees(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Specialty (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Medicine Specialist"
                        value={customDoctorSpecialty}
                        onChange={(e) => setCustomDoctorSpecialty(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Designation & Hospital (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Consultant, Barishal Medical College"
                        value={customDoctorDesignation}
                        onChange={(e) => setCustomDoctorDesignation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">BMDC Reg No. (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. BMDC Reg No: A-12345"
                        value={customDoctorBmdc}
                        onChange={(e) => setCustomDoctorBmdc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
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
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Save Doctor
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Visit Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot *</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="07:00 PM">07:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Confirm Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Serial Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200" id="print-token-slip">
            <div className="text-center pb-4 border-b border-dashed border-slate-200 space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hospital & Diagnostic Services</h3>
              <p className="text-[10px] text-slate-500">Helpline: 09612345678</p>
              <span className="inline-block mt-2 bg-slate-100 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200">
                Appointment Ticket
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-bold text-indigo-600 text-sm">#{selectedSlip.serialNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-semibold text-slate-800">{selectedSlip.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-mono text-slate-700">{selectedSlip.patientPhone}</span>
              </div>
              <div className="border-t border-slate-100 my-2 pt-2"></div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-800">{selectedSlip.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-600 text-[11px]">{selectedSlip.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-700">{selectedSlip.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Slot:</span>
                <span className="font-semibold text-slate-700">{selectedSlip.time}</span>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-dashed border-slate-200 text-[10px] text-rose-500 font-medium">
              * Please arrive at the hospital on time.
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Ticket
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Doctor:</label>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Doctors</option>
            {doctorsList.map((doc, idx) => (
              <option key={idx} value={doc.nameEn}>{doc.nameEn} - {doc.degreesEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 text-center">Serial #</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Mobile</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Ticket</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  No appointments found for the selected date or doctor.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-indigo-700 bg-indigo-50/20">#{app.serialNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{app.patientName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-600">{app.patientPhone}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{app.doctorName}</span>
                    <span className="block text-[10px] text-slate-500">{app.specialty}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{app.date}</span>
                    <span className="block text-[10px] text-slate-500">{app.time}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                      app.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : app.status === 'Cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        app.status === 'Completed' ? 'bg-emerald-500' : app.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
                      }`}></span>
                      {app.status === 'Completed' ? 'Completed' : app.status === 'Cancelled' ? 'Cancelled' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedSlip(app)}
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 inline-flex items-center gap-1 cursor-pointer font-semibold text-[10px]"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Ticket
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {app.status === 'Pending' && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'Completed')}
                          title="Complete"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'Cancelled')}
                          title="Cancel"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
