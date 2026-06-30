import React, { useState } from 'react';
import { Patient } from '../types';
import { UserPlus, Search, Edit2, Trash2, Heart, PlusCircle, Calendar, Receipt, Clipboard, Hospital } from 'lucide-react';

interface PatientManagementProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onDirectAction: (tab: string, patient: Patient) => void;
}

export default function PatientManagement({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onDirectAction,
}: PatientManagementProps) {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [address, setAddress] = useState('');
  const [initialComplaint, setInitialComplaint] = useState('');

  const openAddForm = () => {
    setEditingPatient(null);
    setName('');
    setPhone('');
    setAge('');
    setGender('Male');
    setBloodGroup('A+');
    setAddress('');
    setInitialComplaint('');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setPhone(p.phone);
    setAge(p.age);
    setGender(p.gender);
    setBloodGroup(p.bloodGroup);
    setAddress(p.address);
    setInitialComplaint(p.initialComplaint);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !age) {
      alert('Please fill out name, phone number, and age.');
      return;
    }

    if (editingPatient) {
      onUpdatePatient({
        ...editingPatient,
        name,
        phone,
        age: Number(age),
        gender,
        bloodGroup,
        address,
        initialComplaint,
      });
    } else {
      onAddPatient({
        name,
        phone,
        age: Number(age),
        gender,
        bloodGroup,
        address,
        initialComplaint,
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the file for patient "${name}"?`);
    if (confirmDelete) {
      onDeletePatient(id);
    }
  };

  // Filters and search
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    const matchesGender = genderFilter ? p.gender === genderFilter : true;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="patient-management-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Patient Registration & Management (Patient Directory)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Open a new patient file and search for existing patients' information.</p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          New Patient Registration
        </button>
      </div>

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              {editingPatient ? 'Update Patient Profile' : 'New Patient Registration Form'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Md. Maruf Hasan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age *</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    min="0"
                    max="150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Village, Thana, District"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Complaint or Symptoms</label>
                <textarea
                  value={initialComplaint}
                  onChange={(e) => setInitialComplaint(e.target.value)}
                  placeholder="Describe the patient's physical issues or symptoms"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {editingPatient ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="relative col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patient Table list */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Mobile</th>
              <th className="py-3 px-4">Age & Gender</th>
              <th className="py-3 px-4">Symptoms</th>
              <th className="py-3 px-4 text-center">Quick Actions</th>
              <th className="py-3 px-4 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No registered patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{p.id.substring(0, 5)}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{p.phone}</td>
                  <td className="py-3 px-4">
                    {p.age} Yrs ({p.gender === 'Male' ? 'Male' : p.gender === 'Female' ? 'Female' : 'Other'})
                  </td>
                  <td className="py-3 px-4 max-w-[180px] truncate" title={p.initialComplaint}>
                    {p.initialComplaint || <span className="text-slate-300">-</span>}
                  </td>
                  {/* Quick Action triggers */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onDirectAction('appointments', p)}
                        title="Book Appointment"
                        className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDirectAction('billing', p)}
                        title="Create Diagnostic Bill"
                        className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDirectAction('prescription', p)}
                        title="Write Prescription"
                        className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDirectAction('admission', p)}
                        title="Indoor Admission"
                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        <Hospital className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  {/* Edit/Delete triggers */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditForm(p)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
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
  );
}
