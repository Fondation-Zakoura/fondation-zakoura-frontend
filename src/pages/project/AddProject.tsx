import React, { useRef, useState } from 'react';
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
import type { ProjectInputRefKeys } from '@/features/types/project';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Trash, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [partnerErrors, setPartnerErrors] = useState<{ [idx: number]: { [key: string]: string } }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [partnerTouched, setPartnerTouched] = useState<{ [idx: number]: { [key: string]: boolean } }>(
    { 0: {} }
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingSubmit, setPendingSubmit] = useState<null | React.FormEvent>(null);
  const [diffPercent, setDiffPercent] = useState(0);
  const [overBudget, setOverBudget] = useState(false);
  const navigate = useNavigate();

  const { data: formOptions, isLoading: optionsLoading } = useGetProjectFormOptionsQuery();
  const [addProject, { isLoading: submitting }] = useAddProjectMutation();

  const [startDate, setStartDate] = useState<Date | undefined>(form.start_date ? new Date(form.start_date) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(form.end_date ? new Date(form.end_date) : undefined);
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>(form.actual_start_date ? new Date(form.actual_start_date) : undefined);

  const inputRefs: Record<ProjectInputRefKeys, React.RefObject<any>> = {
    project_name: useRef(null),
    project_nature: useRef(null),
    project_type: useRef(null),
    project_status: useRef(null),
    start_date: useRef(null),
    actual_start_date: useRef(null),
    end_date: useRef(null),
    responsible: useRef(null),
    total_budget: useRef(null),
    bank_account: useRef(null),
    zakoura_contribution: useRef(null),
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Real-time validation, but only show error if touched
    const fieldErrs = validate();
    setErrors(fieldErrs);
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrs = validate();
    setErrors(fieldErrs);
  };

  const handlePartnerSelectChange = (idx: number, name: string, value: string) => {
    const newPartners = [...partners];
    newPartners[idx][name as keyof typeof newPartners[0]] = value;
    setPartners(newPartners);
    setPartnerErrors(prev => ({
      ...prev,
      [idx]: { ...prev[idx], [name]: '' }
    }));
    // Real-time validation for partner fields
    const pErrs = validatePartners(newPartners);
    setPartnerErrors(pErrs);
  };

  const handlePartnerBlur = (idx: number, name: string) => {
    setPartnerTouched(prev => ({
      ...prev,
      [idx]: { ...prev[idx], [name]: true }
    }));
    const pErrs = validatePartners(partners);
    setPartnerErrors(pErrs);
  };

  const addPartner = () => {
    setPartners([...partners, { partner_id: '', partner_role: '', partner_contribution: '' }]);
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.project_name) newErrors.project_name = "Nom du projet requis";
    if (!form.project_nature) newErrors.project_nature = "Nature du projet requis";
    if (!form.project_type_id) newErrors.project_type_id = "Type de projet requis";
    if (!form.project_status_id) newErrors.project_status_id = "Statut requis";
    if (!form.start_date) newErrors.start_date = "Date de lancement requise";
    if (!form.actual_start_date) newErrors.actual_start_date = "Date de lancement réelle requise";
    if (!form.end_date) newErrors.end_date = "Date de clôture requise";
    if (!form.responsible_id) newErrors.responsible_id = "Responsable requis";
    if (!form.total_budget) newErrors.total_budget = "Budget total requis";
    if (!form.bank_account_id) newErrors.bank_account_id = "Compte bancaire requis";
    if (!form.zakoura_contribution) newErrors.zakoura_contribution = "Apport FZ requis";
    // Numeric range checks
    if (form.total_budget && Number(form.total_budget) < 0) newErrors.total_budget = "Le budget ne peut pas être négatif";
    if (form.zakoura_contribution && (Number(form.zakoura_contribution) < 0 || Number(form.zakoura_contribution) > 100)) newErrors.zakoura_contribution = "L'apport FZ doit être entre 0 et 100";
    // partners.forEach((partner, idx) => {
    //   if (partner.partner_contribution && (Number(partner.partner_contribution) < 0 || Number(partner.partner_contribution) > 100)) {
    //     if (!partnerErrors[idx]) partnerErrors[idx] = {};
    //     partnerErrors[idx].partner_contribution = "L'apport partenaire doit être entre 0 et 100";
    //   }
    // });
    // Date logic validation (one error per field)
    const dateErrs: { [key: string]: string } = {};
    if (form.start_date && form.actual_start_date && form.end_date) {
      const start = new Date(form.start_date);
      const actual = new Date(form.actual_start_date);
      const end = new Date(form.end_date);
      if (start > actual) {
        dateErrs.actual_start_date = "La date de début réelle doit être postérieure ou égale à la date de lancement.";
      } else if (actual >= end) {
        dateErrs.actual_start_date = "La date de début réelle doit être antérieure à la date de clôture.";
      }
      if (start >= end) {
        dateErrs.end_date = "La date de clôture doit être postérieure à la date de lancement.";
      }
    }
    setDateErrors(dateErrs);
    return { ...newErrors, ...dateErrs };
  };

  const validatePartners = (partnersArg = partners) => {
    const newPartnerErrors: { [idx: number]: { [key: string]: string } } = {};
    partnersArg.forEach((partner, idx) => {
      const pErr: { [key: string]: string } = {};
      if (partner.partner_id) {
        if (!partner.partner_role) pErr.partner_role = "Rôle requis";
        if (!partner.partner_contribution) pErr.partner_contribution = "Apport requis";
      }
      if (Object.keys(pErr).length) newPartnerErrors[idx] = pErr;
    });
    return newPartnerErrors;
  };

  const getTotalPercent = () => {
    const zakoura = Number(form.zakoura_contribution) || 0;
    const partnersSum = partners.reduce((sum, p) => sum + (Number(p.partner_contribution) || 0), 0);
    return { zakoura, partnersSum, sum: zakoura + partnersSum };
  };

  const checkPercentSum = () => {
    const { zakoura, partnersSum, sum } = getTotalPercent();
    if (sum < 100) {
      return {
        valid: false,
        message: `Il reste ${(100 - sum).toFixed(2)}% du budget à répartir. Voulez-vous continuer ?`,
        diff: 100 - sum,
        over: false
      };
    } else if (sum > 100) {
      return {
        valid: false,
        message: `Le total dépasse le budget de ${(sum - 100).toFixed(2)}%. Voulez-vous continuer ?`,
        diff: sum - 100,
        over: true
      };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fieldErrors = validate();
    const pErrors = validatePartners();
    setErrors(fieldErrors);
    setPartnerErrors(pErrors);
    if (Object.keys(fieldErrors).length > 0 || Object.keys(pErrors).length > 0) {
      const firstInvalidKey = Object.keys(fieldErrors)[0] as ProjectInputRefKeys;
      inputRefs[firstInvalidKey].current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRefs[firstInvalidKey].current.focus();
      return;
    }
    const check = checkPercentSum();
    if (!check.valid) {
      setModalMessage(check.message || '');
      setShowModal(true);
      setPendingSubmit(e);
      setDiffPercent(check.diff || 0);
      setOverBudget(check.over || false);
      return;
    }
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
      const response = await addProject(payload).unwrap();
      navigate('/projects');
    } catch (err: any) {
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

  const handleModalConfirm = async () => {
    setShowModal(false);
    if (pendingSubmit) {
      setPendingSubmit(null);
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
        const response = await addProject(payload).unwrap();
        navigate('/projects');
      } catch (err: any) {
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
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingSubmit(null);
  };

  const { zakoura, partnersSum, sum: percentSum } = getTotalPercent();

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
          <div className="bg-white rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 shadow p-6 mb-4">
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 font-semibold mb-2 text-left">Nom du projet</label>
              <Input
                name="project_name"
                ref={inputRefs.project_name}
                value={form.project_name}
                onChange={(e) => handleSelectChange('project_name', e.target.value)}
                onBlur={() => handleBlur('project_name')}
                className={`border ${errors.project_name && touched.project_name ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition`}
                placeholder="Entrer le nom du projet"
              />
              {errors.project_name && touched.project_name && <div className="text-red-500 text-xs mt-1">{errors.project_name}</div>}
            </div>
            <div>
                <label className="block text-gray-700 flex-1 font-semibold mb-2 text-left">Responsable</label>
                <div className="w-full">
                  <Combobox
                    options={formOptions?.users?.map((u: any) => ({ value: String(u.id), label: u.name })) || []}
                    value={form.responsible_id}
                    onChange={val => handleSelectChange('responsible_id', val)}
                    placeholder="Sélectionner le responsable"
                    disabled={optionsLoading}
                  />
                </div>
                {errors.responsible_id && touched.responsible_id && <div className="text-red-500 text-xs mt-1">{errors.responsible_id}</div>}
            </div>
          </div>
          {/* Détails du projet */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Nature du projet</label>
                <div className="w-full" ref={inputRefs.project_nature}>
                  <Select  value={form.project_nature} onValueChange={val => handleSelectChange('project_nature', val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner la nature" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions?.project_nature_options?.map((n: string) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.project_nature && touched.project_nature && <div className="text-red-500 text-xs mt-1">{errors.project_nature}</div>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Type de projet</label>
                <div className="w-full">
                  <Combobox
                    options={formOptions?.project_types?.map((t: any) => ({ value: String(t.id), label: t.name })) || []}
                    value={form.project_type_id}
                    onChange={val => handleSelectChange('project_type_id', val)}
                    placeholder="Sélectionner le type"
                    disabled={optionsLoading}
                  />
                </div>
                {errors.project_type_id && touched.project_type_id && <div className="text-red-500 text-xs mt-1">{errors.project_type_id}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Statut du projet</label>
                <div className="w-full">
                  <Combobox
                    options={formOptions?.project_statuses?.map((s: any) => ({ value: String(s.id), label: s.name })) || []}
                    value={form.project_status_id}
                    onChange={val => handleSelectChange('project_status_id', val)}
                    placeholder="Sélectionner le statut"
                    disabled={optionsLoading}
                  />
                </div>
                {errors.project_status_id && touched.project_status_id && <div className="text-red-500 text-xs mt-1">{errors.project_status_id}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Date de lancement</label>
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
                {errors.start_date && touched.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Date de clôture</label>
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
                {errors.end_date && touched.end_date && <div className="text-red-500 text-xs mt-1">{errors.end_date}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Date de début réelle</label>
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
                {errors.actual_start_date && touched.actual_start_date && <div className="text-red-500 text-xs mt-1">{errors.actual_start_date}</div>}
              </div>
              
            </div>
            {/* Partners section */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Partenaires</h3>
              <div className="flex flex-col gap-6">
                {partners.map((partner, idx) => (
                  <div key={idx} className=" border  rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-4 relative shadow-sm">
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">Nom du partenaire</label>
                        <Combobox
                          options={formOptions?.partners?.data?.map((p: any) => ({ value: String(p.id), label: p.partner_name })) || []}
                          value={partner.partner_id}
                          onChange={value => handlePartnerSelectChange(idx, 'partner_id', value)}
                          placeholder="Sélectionner un partenaire"
                          disabled={optionsLoading}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">Rôle</label>
                        <div className="w-full">
                          <Combobox
                            options={formOptions?.partner_roles ? Object.entries(formOptions.partner_roles).map(([key, label]) => ({ value: String(key), label: (label as string).charAt(0).toUpperCase() + (label as string).slice(1) })) : []}
                            value={partner.partner_role}
                            onChange={val => handlePartnerSelectChange(idx, 'partner_role', val)}
                            placeholder="Sélectionner un rôle"
                            disabled={optionsLoading}
                          />
                          {partnerErrors[idx]?.partner_role && partnerTouched[idx]?.partner_role && <div className="text-red-500 text-xs mt-1">{partnerErrors[idx].partner_role}</div>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">% Apport Partenaire</label>
                        <Input
                          name="partner_contribution"
                          placeholder="Apport Partenaire"
                          min={0}
                          max={100}
                          type="number"
                          value={partner.partner_contribution}
                          onChange={(e) => handlePartnerSelectChange(idx, 'partner_contribution', e.target.value)}
                          className={`border ${partnerErrors[idx]?.partner_contribution && partnerTouched[idx]?.partner_contribution ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition`}
                        />
                        {partnerErrors[idx]?.partner_contribution && partnerTouched[idx]?.partner_contribution && <div className="text-red-500 text-xs mt-1">{partnerErrors[idx].partner_contribution}</div>}
                      </div>
                    </div>
                    {partners.length > 0 && (
                      <Button
                        type="button"
                        onClick={() => removePartner(idx)}
                        className=" text-red-500 text-xs font-semibold px-2 py-1 border border-red-200 rounded transition hover:bg-red-600 hover:text-white bg-white shadow"
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
                <label className="block text-gray-700 font-semibold mb-2 text-left">Budget total</label>
                <Input
                  name="total_budget"
                  type="number"
                  min={0}
                  value={form.total_budget}
                  onChange={(e) => handleSelectChange('total_budget', e.target.value)}
                  className={`border ${errors.total_budget && touched.total_budget ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition`}
                  placeholder="Entrer le budget total"
                />
                <div className="text-xs text-gray-500 mt-1">Le budget est exprimé en MAD (Dirham marocain).</div>

                {errors.total_budget && touched.total_budget && <div className="text-red-500 text-xs mt-1">{errors.total_budget}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Compte Bancaire de Projet</label>
                <Combobox
                  options={formOptions?.bank_accounts?.map((b: any) => ({ value: String(b.id), label: b.account_title })) || []}
                  value={form.bank_account_id}
                  onChange={value => handleSelectChange('bank_account_id', value)}
                  placeholder="Sélectionner le compte bancaire"
                  disabled={optionsLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Apport FZ</label>
                <Input
                  name="zakoura_contribution"
                  type="number"
                  max={100}
                  min={0}
                  value={form.zakoura_contribution}
                  onChange={(e) => handleSelectChange('zakoura_contribution', e.target.value)}
                  className={`border ${errors.zakoura_contribution && touched.zakoura_contribution ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition`}
                  placeholder="Entrer l'apport FZ (%)"
                />
                {errors.zakoura_contribution && touched.zakoura_contribution && <div className="text-red-500 text-xs mt-1">{errors.zakoura_contribution}</div>}
              </div>
            </div>
            <div className={`mt-2 text-center text-lg font-bold ${percentSum < 100 ? 'text-red-600' : percentSum > 100 ? 'text-green-600' : 'text-gray-700'}`}>
              <Badge>Total d'apports %: <Badge  className={`outline ${percentSum < 100 ? 'bg-red-600' : percentSum > 100 ? 'bg-green-600' : 'text-white'} `}>  {percentSum.toFixed(2)}%</Badge> </Badge>
            </div>
          </div>
          {/* Notes et/ou observation */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <label className="block text-gray-700 font-semibold mb-2 text-left">Notes et/ou observation</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={(e) => handleSelectChange('notes', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              rows={3}
              placeholder="Entrer des notes ou observations (optionnel)"
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
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <div className="text-lg font-semibold text-blue-900">Alerte budget</div>
          </DialogHeader>
          <div className="py-4 text-gray-800 text-center">{modalMessage}</div>
          <DialogFooter className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleModalCancel} type="button">Annuler</Button>
            <Button onClick={handleModalConfirm} type="button" className="bg-blue-900 text-white">Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProject; 