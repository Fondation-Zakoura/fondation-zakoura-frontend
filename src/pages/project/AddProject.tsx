import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectFormOptionsQuery, useAddProjectMutation } from '@/features/api/projectsApi';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { Card } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';

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
  const [partners, setPartners] = useState([{ partner_id: '', partner_role: '', partner_contribution: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { data: formOptions, isLoading: optionsLoading } = useGetProjectFormOptionsQuery();
  const [addProject, { isLoading: submitting }] = useAddProjectMutation();

  const [startDate, setStartDate] = useState<Date | undefined>(form.start_date ? new Date(form.start_date) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(form.end_date ? new Date(form.end_date) : undefined);
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>(form.actual_start_date ? new Date(form.actual_start_date) : undefined);

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePartnerSelectChange = (idx: number, name: string, value: string) => {
    const newPartners = [...partners];
    newPartners[idx][name as keyof typeof newPartners[0]] = value;
    setPartners(newPartners);
  };

  const addPartner = () => {
    setPartners([...partners, { partner_id: '', partner_role: '', partner_contribution: '' }]);
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
          partner_role: p.partner_role, 
          partner_contribution: p.partner_contribution ? Number(p.partner_contribution) : undefined 
        }))
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) {
          delete (payload as any)[key];
        }
      });

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
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Ajouter un projet"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Projets' },
            { label: 'Ajouter', active: true }
          ]}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8">
          {/* Informations (Français) */}
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Nom du projet</label>
              <Input
                name="project_name"
                value={form.project_name}
                onChange={(e) => handleSelectChange('project_name', e.target.value)}
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
                <div className="w-full">
                  <Select value={form.project_nature} onValueChange={val => handleSelectChange('project_nature', val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner la nature" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions?.project_nature_options?.map((n: string) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Type de projet</label>
                <div className="w-full">
                  <Combobox
                    options={formOptions?.project_types?.map((t: any) => ({ value: String(t.id), label: t.name })) || []}
                    value={form.project_type_id}
                    onChange={val => handleSelectChange('project_type_id', val)}
                    placeholder="Sélectionner le type"
                    disabled={optionsLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Statut du projet</label>
                <div className="w-full">
                  <Combobox
                    options={formOptions?.project_statuses?.map((s: any) => ({ value: String(s.id), label: s.name })) || []}
                    value={form.project_status_id}
                    onChange={val => handleSelectChange('project_status_id', val)}
                    placeholder="Sélectionner le statut"
                    disabled={optionsLoading}
                  />
                </div>
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
                        handleSelectChange('start_date', date ? format(date, 'yyyy-MM-dd') : '');
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
                        handleSelectChange('end_date', date ? format(date, 'yyyy-MM-dd') : '');
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
                        handleSelectChange('actual_start_date', date ? format(date, 'yyyy-MM-dd') : '');
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
                <div className="w-full">
                  <Combobox
                    options={formOptions?.users?.map((u: any) => ({ value: String(u.id), label: u.name })) || []}
                    value={form.responsible_id}
                    onChange={val => handleSelectChange('responsible_id', val)}
                    placeholder="Sélectionner le responsable"
                    disabled={optionsLoading}
                  />
                </div>
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
                        <Combobox
                          options={formOptions?.partners?.data?.map((p: any) => ({ value: String(p.id), label: p.partner_name })) || []}
                          value={partner.partner_id}
                          onChange={value => handlePartnerSelectChange(idx, 'partner_id', value)}
                          placeholder="Sélectionner un partenaire"
                          disabled={optionsLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1">Rôle</label>
                        <div className="w-full">
                          <Combobox
                            options={formOptions?.partner_roles ? Object.entries(formOptions.partner_roles).map(([key, label]) => ({ value: String(key), label: (label as string).charAt(0).toUpperCase() + (label as string).slice(1) })) : []}
                            value={partner.partner_role}
                            onChange={val => handlePartnerSelectChange(idx, 'partner_role', val)}
                            placeholder="Sélectionner un rôle"
                            disabled={optionsLoading}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1">partner_contribution</label>
                        <Input
                          name="partner_contribution"
                          placeholder="Apport Partenaire"
                          type="number"
                          value={partner.partner_contribution}
                          onChange={(e) => handlePartnerSelectChange(idx, 'partner_contribution', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                          required
                        />
                      </div>
                    </div>
                    {partners.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePartner(idx)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 border border-red-200 rounded transition bg-white shadow"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={addPartner}
                  className="px-6 py-2 rounded-lg font-bold transition shadow-sm flex items-center gap-2"
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
                  onChange={(e) => handleSelectChange('total_budget', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Compte Bancaire de Projet</label>
                <Combobox
                  options={formOptions?.bank_accounts?.map((b: any) => ({ value: String(b.id), label: b.rib })) || []}
                  value={form.bank_account_id}
                  onChange={value => handleSelectChange('bank_account_id', value)}
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
                  onChange={(e) => handleSelectChange('zakoura_contribution', e.target.value)}
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
              onChange={(e) => handleSelectChange('notes', e.target.value)}
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
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
        </Card>
      </form>
    </div>
  );
};

export default AddProject; 