import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProjectFormOptionsQuery, useGetProjectQuery, useUpdateProjectMutation } from '@/features/api/projectsApi';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import type { Project } from '@/features/types/project';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import { Card } from '@/components/ui/card';
import { Trash2Icon } from 'lucide-react';

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
  created_by_id: ''
};

const EditProject: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const { data: p, isLoading: projectLoading, isError } = useGetProjectQuery(projectId);
  const { data: formOptions, isLoading: optionsLoading } = useGetProjectFormOptionsQuery();
  const [updateProject, { isLoading: submitting }] = useUpdateProjectMutation();
  const [form, setForm] = useState(initialForm);
  const [partners, setPartners] = useState([{ partner_id: '', partner_name: '', partner_role: '', partner_contribution: '' }]);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(form.start_date ? new Date(form.start_date) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(form.end_date ? new Date(form.end_date) : undefined);
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>(form.actual_start_date ? new Date(form.actual_start_date) : undefined);

  useEffect(() => {
    if (p && formOptions) {
      setForm({
        project_name: p.project_name || '',
        project_nature: p.project_nature || '',
        project_type_id: p.project_type?.id ? String(p.project_type.id) : '',
        project_status_id: p.project_status?.id ? String(p.project_status.id) : '',
        start_date: p.start_date ? p.start_date.slice(0, 10) : '',
        end_date: p.end_date ? p.end_date.slice(0, 10) : '',
        actual_start_date: p.actual_start_date ? p.actual_start_date.slice(0, 10) : '',
        responsible_id: p.responsible?.id ? String(p.responsible.id) : '',
        total_budget: p.total_budget ? String(p.total_budget) : '',
        project_bank_account_id: p.project_bank_account?.id ? String(p.project_bank_account.id) : '',
        zakoura_contribution: p.zakoura_contribution ? String(p.zakoura_contribution) : '',
        notes: p.notes ?? '',
        created_by_id: p.created_by?.id ? String(p.created_by.id) : '',
      });
      // Prefill partners
      const projectPartners = Array.isArray(p.partners) ? p.partners : [];
      console.log('Raw partners from backend:', p.partners);
      const mappedPartners = projectPartners.length > 0
        ? projectPartners.map((partner: any) => ({
            partner_id: partner.id ? String(partner.id) : '',
            partner_name: partner.partner_name || partner.name || '',
            partner_role: partner.pivot?.partner_role || '',
            partner_contribution: partner.pivot?.partner_contribution ? String(partner.pivot.partner_contribution) : '',
          }))
        : [{ partner_id: '', partner_name: '', partner_role: '', partner_contribution: '' }];
      console.log('Mapped partners:', mappedPartners);
      setPartners(mappedPartners);
    }
  }, [p, formOptions]);

  useEffect(() => {
    setStartDate(form.start_date ? new Date(form.start_date) : undefined);
    setEndDate(form.end_date ? new Date(form.end_date) : undefined);
    setActualStartDate(form.actual_start_date ? new Date(form.actual_start_date) : undefined);
  }, [form.start_date, form.end_date, form.actual_start_date]);

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
    setPartners([...partners, { partner_id: '', partner_name: '', partner_role: '', partner_contribution: '' }]);
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!p) return;
    try {
      const payload = {
        id: p.id,
        ...form,
        project_type_id: form.project_type_id ? Number(form.project_type_id) : undefined,
        project_status_id: form.project_status_id ? Number(form.project_status_id) : undefined,
        responsible_id: form.responsible_id ? Number(form.responsible_id) : undefined,
        total_budget: form.total_budget ? Number(form.total_budget) : undefined,
        project_bank_account_id: form.project_bank_account_id ? Number(form.project_bank_account_id) : undefined,
        zakoura_contribution: form.zakoura_contribution ? Number(form.zakoura_contribution) : undefined,
        created_by_id: form.created_by_id ? Number(form.created_by_id) : undefined,
        partners: partners.map(p => ({
          partner_id: p.partner_id ? Number(p.partner_id) : undefined,
          partner_role: p.partner_role,
          partner_contribution: p.partner_contribution ? Number(p.partner_contribution) : undefined
        }))
      };
      Object.keys(payload).forEach(key => {
        if ((payload as any)[key] === undefined) {
          delete (payload as any)[key];
        }
      });
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      await updateProject(payload as any).unwrap();
      navigate('/projects');
    } catch (err: any) {
      console.error('Full API Error:', {
        status: err.status,
        data: err.data,
        message: err.message,
        stack: err.stack,
        originalError: err
      });
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

  if (projectLoading || optionsLoading) {
    return <div className="p-8 text-center text-lg font-semibold text-blue-900">Chargement du projet...</div>;
  }
  if (isError || !p) {
    return <div className="p-8 text-center text-lg font-semibold text-red-600">Erreur lors du chargement du projet.</div>;
  }

  console.log('form.project_status_id', form.project_status_id);
  console.log('formOptions.project_statuses', formOptions?.project_statuses?.map((s: any) => s.id));

  return (
    <div className="p-8 font-nunito">
      <div className='flex justify-between items-center mb-8'>
        <PageHeaderLayout
          title="Modifier le projet"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Projets',url:'/projects' },
            { label: 'Modifier', active: true }
          ]}
        />
      </div>
      <Card className='p-8'>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations (Français) */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Nom du projet</label>
            <Input
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
              <label className="block text-gray-700 font-semibold mb-2">Type de projet</label>
              <Combobox
                options={formOptions?.project_types?.filter(Boolean).map((t: any) => ({ value: String(t.id), label: t.name })) || []}
                value={form.project_type_id}
                onChange={value => handleChange({ target: { name: 'project_type_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Sélectionner le type de projet"
                disabled={optionsLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Statut du projet</label>
              <Combobox
                options={formOptions?.project_statuses?.filter(Boolean).map((s: any) => ({ value: String(s.id), label: s.name })) || []}
                value={form.project_status_id}
                onChange={value => handleChange({ target: { name: 'project_status_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Sélectionner le statut"
                disabled={optionsLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de lancement</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {startDate ? format(startDate, 'yyyy-MM-dd') : 'Sélectionner la date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={date => {
                      setStartDate(date);
                      handleChange({ target: { name: 'start_date', value: date ? format(date, 'yyyy-MM-dd') : '' } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 5}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de début réelle</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {actualStartDate ? format(actualStartDate, 'yyyy-MM-dd') : 'Sélectionner la date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={actualStartDate}
                    onSelect={date => {
                      setActualStartDate(date);
                      handleChange({ target: { name: 'actual_start_date', value: date ? format(date, 'yyyy-MM-dd') : '' } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 5}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date de clôture</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {endDate ? format(endDate, 'yyyy-MM-dd') : 'Sélectionner la date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={date => {
                      setEndDate(date);
                      handleChange({ target: { name: 'end_date', value: date ? format(date, 'yyyy-MM-dd') : '' } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 5}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Responsable</label>
              <Combobox
                options={formOptions?.users?.map((u: any) => ({ value: String(u.id), label: u.name })) || []}
                value={form.responsible_id}
                onChange={value => handleChange({ target: { name: 'responsible_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Sélectionner le responsable"
                disabled={optionsLoading}
              />
            </div>
          </div>
          {/* Partners section */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Partenaires</h3>
            <div className="flex flex-col gap-6">
              {partners.map((partner, idx) => (
                <div key={idx} className="bg-gray-300 border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-4 relative shadow-sm">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Nom du partenaire</label>
                      <Combobox
                        options={formOptions?.partners?.data?.map((p: any) => ({ value: String(p.id), label: p.partner_name })) || []}
                        value={partner.partner_id}
                        onChange={value => handlePartnerChange(idx, { target: { name: 'partner_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                        placeholder="Sélectionner un partenaire"
                        disabled={optionsLoading}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Rôle</label>
                      <Combobox
                        options={formOptions?.partner_roles ? Object.entries(formOptions.partner_roles).map(([key, label]) => ({ value: String(label), label: label as string })) : []}
                        value={partner.partner_role}
                        onChange={value => handlePartnerChange(idx, { target: { name: 'partner_role', value } } as React.ChangeEvent<HTMLInputElement>)}
                        placeholder="Sélectionner un rôle"
                        disabled={optionsLoading}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-semibold mb-1">Apport</label>
                      <Input
                        name="partner_contribution"
                        placeholder="Apport Partenaire"
                        type="number"
                        value={partner.partner_contribution}
                        onChange={e => handlePartnerChange(idx, e)}
                        className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                      />
                    </div>
                  </div>
                  {partners.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => removePartner(idx)}
                      className=" text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 border border-red-200 rounded transition hover:bg-red-600 hover:text-white bg-white shadow"
                    >
                      <Trash2Icon/>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={addPartner}
                className=" px-6 py-2 rounded-lg font-bold  transition shadow-sm flex items-center gap-2"
              >
                <span className="text-xl leading-none">+</span> Ajouter un partenaire
              </Button>
            </div>
          </div>
        </div>
        {/* Détails Financiers */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Budget total</label>
              <Input
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
              <Combobox
                options={formOptions?.bank_accounts?.filter(Boolean).map((b: any) => ({ value: String(b.id), label: b.rib })) || []}
                value={form.project_bank_account_id}
                onChange={value => handleChange({ target: { name: 'project_bank_account_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Sélectionner le compte bancaire"
                disabled={optionsLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Apport FZ</label>
              <Input
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
          <Button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
            onClick={() => navigate('/projects')}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 transition text-white px-8 py-2 rounded-lg font-semibold shadow"
            disabled={submitting}
          >
            {submitting ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </form>
      </Card>
    </div>
  );
};

export default EditProject; 