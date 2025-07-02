import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectFormOptionsQuery, useAddProjectMutation } from '@/features/api/projectsApi';
import { PageHeaderLayout } from '@/layouts/MainLayout';

const initialForm = {
  project_name: '',
  project_nature: '',
  project_type_id: '',
  project_status_id: '',
  start_date: '',
  end_date: '',
  actual_start_date: '',
  responsible_id: '',
  total_budget: '',
  project_bank_account_id: '',
  zakoura_contribution: '',
  notes: '',
  created_by_id: '',
  bank_account_id : ''
};

const AddProject: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [partners, setPartners] = useState([{ partner_id: '', role: '', apport: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: formOptions, isLoading: optionsLoading } = useGetProjectFormOptionsQuery();
  const [addProject, { isLoading: submitting }] = useAddProjectMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePartnerChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newPartners = [...partners];
    newPartners[idx][name as keyof typeof newPartners[0]] = value;
    setPartners(newPartners);
  };

  const addPartner = () => {
    setPartners([...partners, { partner_id: '', role: '', apport: '' }]);
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        project_type_id: form.project_type_id ? Number(form.project_type_id) : undefined,
        project_status_id: form.project_status_id ? Number(form.project_status_id) : undefined,
        responsible_id: form.responsible_id ? Number(form.responsible_id) : undefined,
        total_budget: form.total_budget ? Number(form.total_budget) : undefined,
        project_bank_account_id: form.bank_account_id ? Number(form.bank_account_id) : undefined,
        zakoura_contribution: form.zakoura_contribution ? Number(form.zakoura_contribution) : undefined,
        created_by_id: 1,
        partners: partners.map(p => ({ 
          partner_id: p.partner_id ? Number(p.partner_id) : undefined, 
          role: p.role, 
          apport: p.apport ? Number(p.apport) : undefined 
        }))
      };

      // Remove any undefined values from payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      // Debug logging
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      
      const response = await addProject(payload).unwrap();
      console.log('Server response:', response);
      
      navigate('/projects');
    } catch (err: any) {
      console.error('Full API Error:', {
        status: err.status,
        data: err.data,
        message: err.message,
        stack: err.stack,
        originalError: err
      });

      // Enhanced error message handling
      let errorMessage = 'Erreur inconnue';
      
      if (err.status === 500) {
        errorMessage = 'Erreur serveur: Veuillez vérifier les logs du serveur Laravel';
      } else if (err.data?.errors) {
        errorMessage = Object.values(err.data.errors).flat().join('\n');
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="p-8 font-nunito">
      <PageHeaderLayout
        title="Ajouter un projet"
        breadcrumbs={[
          { label: 'Tableaux de bord' },
          { label: 'Projets' },
          { label: 'Ajouter', active: true }
        ]}
      />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations (Français) */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Nom du projet</label>
            <input
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            />
          </div>
        </div>
        {/* Détails du projet */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nature du projet</label>
              <select
                name="project_nature"
                value={form.project_nature}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
                disabled={optionsLoading}
              >
                <option value="">Sélectionner la nature</option>
                {formOptions?.project_nature_options?.map((n: string) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Type de projet</label>
              <select
                name="project_type_id"
                value={form.project_type_id}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
                disabled={optionsLoading}
              >
                <option value="">Sélectionner le type</option>
                {formOptions?.project_types?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Statut du projet</label>
              <select
                name="project_status_id"
                value={form.project_status_id}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
                disabled={optionsLoading}
              >
                <option value="">Sélectionner le statut</option>
                {formOptions?.project_statuses?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de lancement</label>
              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de clôture</label>
              <input
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de début réelle</label>
              <input
                name="actual_start_date"
                type="date"
                value={form.actual_start_date}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Responsable</label>
              <select
                name="responsible_id"
                value={form.responsible_id}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
                disabled={optionsLoading}
              >
                <option value="">Sélectionner le responsable</option>
                {formOptions?.users?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Partners section */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Partenaires</h3>
            <div className="flex flex-col gap-6">
              {partners.map((partner, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-4 relative shadow-sm">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Nom du partenaire</label>
                      <select
                        name="partner_id"
                        value={partner.partner_id}
                        onChange={e => handlePartnerChange(idx, e)}
                        className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                        disabled={optionsLoading}
                      >
                        <option value="">Sélectionner un partenaire</option>
                        {formOptions?.partners &&
                          (Array.isArray(formOptions.partners)
                            ? formOptions.partners
                            : Object.values(formOptions.partners)
                          ).map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Rôle</label>
                      <input
                        name="role"
                        placeholder="Rôle"
                        value={partner.role}
                        onChange={e => handlePartnerChange(idx, e)}
                        className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Apport</label>
                      <input
                        name="apport"
                        placeholder="Apport"
                        type="number"
                        value={partner.apport}
                        onChange={e => handlePartnerChange(idx, e)}
                        className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                      />
                    </div>
                  </div>
                  {partners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePartner(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 border border-red-200 rounded transition bg-white shadow"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={addPartner}
                className="border-2 border-blue-900 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition shadow-sm flex items-center gap-2"
              >
                <span className="text-xl leading-none">+</span> Ajouter un partenaire
              </button>
            </div>
          </div>
        </div>
        {/* Détails Financiers */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Budget total</label>
              <input
                name="total_budget"
                type="number"
                value={form.total_budget}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
            <label className="block text-gray-700 font-semibold mb-2">Compte Bancaire de Projet</label>
              <select
                name="bank_account_id"
                value={form.bank_account_id}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
                disabled={optionsLoading}
              >
                <option value="">Sélectionner le compte bancaire</option>
                {formOptions?.bank_accounts?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.rib}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Apport FZ</label>
              <input
                name="zakoura_contribution"
                type="number"
                value={form.zakoura_contribution}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
          </div>
        </div>
        {/* Notes et/ou observation */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <label className="block text-gray-700 font-semibold mb-2">Notes et/ou observation</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            rows={3}
          />
        </div>
        {/* Created by (hidden or prefilled for now) */}
        <input type="hidden" name="created_by_id" value={form.created_by_id || 1} />
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
            onClick={() => navigate('/projects')}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 transition text-white px-8 py-2 rounded-lg font-semibold shadow"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
};

export default AddProject; 