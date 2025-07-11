import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProjectFormOptionsQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "@/features/api/projectsApi";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ProjectInputRefKeys } from "@/features/types/project";
import { Combobox } from "@/components/ui/combobox";

const initialForm = {
  project_name: "",
  project_nature: "",
  project_type_id: "",
  project_status_id: "",
  start_date: "",
  end_date: "",
  actual_start_date: "",
  responsible_id: "",
  total_budget: "",
  project_bank_account_id: "",
  zakoura_contribution: "",
  notes: "",
  created_by_id: "",
};

const EditProject: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const {
    data: p,
    isLoading: projectLoading,
    isError,
  } = useGetProjectQuery(projectId);
  const { data: formOptions, isLoading: optionsLoading } =
    useGetProjectFormOptionsQuery();
  const [updateProject, { isLoading: submitting }] = useUpdateProjectMutation();
  const [form, setForm] = useState(initialForm);
  const [partners, setPartners] = useState([
    {
      partner_id: "",
      partner_name: "",
      partner_role: "",
      partner_contribution: "",
    },
  ]);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    form.start_date ? new Date(form.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    form.end_date ? new Date(form.end_date) : undefined
  );
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>(
    form.actual_start_date ? new Date(form.actual_start_date) : undefined
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [partnerErrors, setPartnerErrors] = useState<{
    [idx: number]: { [key: string]: string };
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState<null | React.FormEvent>(
    null
  );
  const [diffPercent, setDiffPercent] = useState(0);
  const [overBudget, setOverBudget] = useState(false);
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({});

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

  useEffect(() => {
    if (p && formOptions) {
      setForm({
        project_name: p.project_name || "",
        project_nature: p.project_nature || "",
        project_type_id: p.project_type?.id ? String(p.project_type.id) : "",
        project_status_id: p.project_status?.id
          ? String(p.project_status.id)
          : "",
        start_date: p.start_date ? p.start_date.slice(0, 10) : "",
        end_date: p.end_date ? p.end_date.slice(0, 10) : "",
        actual_start_date: p.actual_start_date
          ? p.actual_start_date.slice(0, 10)
          : "",
        responsible_id: p.responsible?.id ? String(p.responsible.id) : "",
        total_budget: p.total_budget ? String(p.total_budget) : "",
        project_bank_account_id: p.project_bank_account?.id
          ? String(p.project_bank_account.id)
          : "",
        zakoura_contribution: p.zakoura_contribution
          ? String(p.zakoura_contribution)
          : "",
        notes: p.notes ?? "",
        created_by_id: p.created_by?.id ? String(p.created_by.id) : "",
      });
      // Prefill partners
      const projectPartners = Array.isArray(p.partners) ? p.partners : [];
      const mappedPartners =
        projectPartners.length > 0
          ? projectPartners.map((partner: any) => ({
              partner_id: partner.id ? String(partner.id) : "",
              partner_name: partner.partner_name || partner.name || "",
              partner_role: partner.pivot?.partner_role || "",
              partner_contribution: partner.pivot?.partner_contribution
                ? String(partner.pivot.partner_contribution)
                : "",
            }))
          : [
              {
                partner_id: "",
                partner_name: "",
                partner_role: "",
                partner_contribution: "",
              },
            ];
      setPartners(mappedPartners);
    }
  }, [p, formOptions]);

  useEffect(() => {
    setStartDate(form.start_date ? new Date(form.start_date) : undefined);
    setEndDate(form.end_date ? new Date(form.end_date) : undefined);
    setActualStartDate(
      form.actual_start_date ? new Date(form.actual_start_date) : undefined
    );
  }, [form.start_date, form.end_date, form.actual_start_date]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.project_name) newErrors.project_name = "Nom du projet requis";
    if (!form.project_type_id)
      newErrors.project_type_id = "Type de projet requis";
    if (!form.project_status_id) newErrors.project_status_id = "Statut requis";
    if (!form.start_date) newErrors.start_date = "Date de lancement requise";
    if (!form.end_date) newErrors.end_date = "Date de clôture requise";
    if (!form.responsible_id) newErrors.responsible_id = "Responsable requis";
    if (!form.total_budget) newErrors.total_budget = "Budget total requis";
    if (!form.project_bank_account_id)
      newErrors.project_bank_account_id = "Compte bancaire requis";
    if (!form.zakoura_contribution)
      newErrors.zakoura_contribution = "Apport FZ requis";
    // Date logic validation (one error per field)
    const dateErrs: { [key: string]: string } = {};
    if (form.start_date && form.actual_start_date && form.end_date) {
      const start = new Date(form.start_date);
      const actual = new Date(form.actual_start_date);
      const end = new Date(form.end_date);
      if (start > actual) {
        dateErrs.actual_start_date =
          "La date de début réelle doit être postérieure ou égale à la date de lancement.";
      } else if (actual >= end) {
        dateErrs.actual_start_date =
          "La date de début réelle doit être antérieure à la date de clôture.";
      }
      if (start >= end) {
        dateErrs.end_date =
          "La date de clôture doit être postérieure à la date de lancement.";
      }
    }
    setDateErrors(dateErrs);
    return { ...newErrors, ...dateErrs };
  };

  const validatePartners = () => {
    const newPartnerErrors: { [idx: number]: { [key: string]: string } } = {};
    partners.forEach((partner, idx) => {
      const pErr: { [key: string]: string } = {};
      if (!partner.partner_id) pErr.partner_id = "Partenaire requis";
      if (!partner.partner_role) pErr.partner_role = "Rôle requis";
      if (!partner.partner_contribution)
        pErr.partner_contribution = "Apport requis";
      if (Object.keys(pErr).length) newPartnerErrors[idx] = pErr;
    });
    return newPartnerErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handlePartnerChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newPartners = [...partners];
    newPartners[idx][name as keyof (typeof newPartners)[0]] = value;
    setPartners(newPartners);
    setPartnerErrors((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], [name]: "" },
    }));
  };

  const addPartner = () => {
    setPartners([
      ...partners,
      {
        partner_id: "",
        partner_name: "",
        partner_role: "",
        partner_contribution: "",
      },
    ]);
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  const getTotalPercent = () => {
    const zakoura = Number(form.zakoura_contribution) || 0;
    const partnersSum = partners.reduce(
      (sum, p) => sum + (Number(p.partner_contribution) || 0),
      0
    );
    return { zakoura, partnersSum, sum: zakoura + partnersSum };
  };

  const checkPercentSum = () => {
    const { zakoura, partnersSum, sum } = getTotalPercent();
    if (sum < 100) {
      return {
        valid: false,
        message: `Il reste ${(100 - sum).toFixed(
          2
        )}% du budget à répartir. Voulez-vous continuer ?`,
        diff: 100 - sum,
        over: false,
      };
    } else if (sum > 100) {
      return {
        valid: false,
        message: `Le total dépasse le budget de ${(sum - 100).toFixed(
          2
        )}%. Voulez-vous continuer ?`,
        diff: sum - 100,
        over: true,
      };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fieldErrors = validate();
    const pErrors = validatePartners();
    setErrors(fieldErrors);
    setPartnerErrors(pErrors);
    if (
      Object.keys(fieldErrors).length > 0 ||
      Object.keys(pErrors).length > 0
    ) {
      const firstInvalidKey = Object.keys(
        fieldErrors
      )[0] as ProjectInputRefKeys;
      inputRefs[firstInvalidKey].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      inputRefs[firstInvalidKey].current.focus();
      return;
    }
    if (!p) return;
    const check = checkPercentSum();
    if (!check.valid) {
      setModalMessage(check.message || "");
      setShowModal(true);
      setPendingSubmit(e);
      setDiffPercent(check.diff || 0);
      setOverBudget(check.over || false);
      return;
    }
    try {
      const payload = {
        id: p.id,
        ...form,
        project_type_id: form.project_type_id
          ? Number(form.project_type_id)
          : undefined,
        project_status_id: form.project_status_id
          ? Number(form.project_status_id)
          : undefined,
        responsible_id: form.responsible_id
          ? Number(form.responsible_id)
          : undefined,
        total_budget: form.total_budget ? Number(form.total_budget) : undefined,
        project_bank_account_id: form.project_bank_account_id
          ? Number(form.project_bank_account_id)
          : undefined,
        zakoura_contribution: form.zakoura_contribution
          ? Number(form.zakoura_contribution)
          : undefined,
        created_by_id: form.created_by_id
          ? Number(form.created_by_id)
          : undefined,
        partners: partners.map((p) => ({
          partner_id: p.partner_id ? Number(p.partner_id) : undefined,
          partner_role: p.partner_role,
          partner_contribution: p.partner_contribution
            ? Number(p.partner_contribution)
            : undefined,
        })),
      };
      Object.keys(payload).forEach((key) => {
        if ((payload as any)[key] === undefined) {
          delete (payload as any)[key];
        }
      });
      await updateProject(payload as any).unwrap();
      navigate("/projects");
    } catch (err: any) {
      let errorMessage = "Erreur inconnue";
      if (err.status === 500) {
        errorMessage =
          "Erreur serveur: Veuillez vérifier les logs du serveur Laravel";
      } else if (err.data?.errors) {
        errorMessage = Object.values(err.data.errors).flat().join("\n");
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      }
      setError(errorMessage);
    }
  };

  // Handler for modal confirmation
  const handleModalConfirm = async () => {
    setShowModal(false);
    if (pendingSubmit) {
      setPendingSubmit(null);
      if (!p) return;
      try {
        const payload = {
          id: p.id,
          ...form,
          project_type_id: form.project_type_id
            ? Number(form.project_type_id)
            : undefined,
          project_status_id: form.project_status_id
            ? Number(form.project_status_id)
            : undefined,
          responsible_id: form.responsible_id
            ? Number(form.responsible_id)
            : undefined,
          total_budget: form.total_budget
            ? Number(form.total_budget)
            : undefined,
          project_bank_account_id: form.project_bank_account_id
            ? Number(form.project_bank_account_id)
            : undefined,
          zakoura_contribution: form.zakoura_contribution
            ? Number(form.zakoura_contribution)
            : undefined,
          created_by_id: form.created_by_id
            ? Number(form.created_by_id)
            : undefined,
          partners: partners.map((p) => ({
            partner_id: p.partner_id ? Number(p.partner_id) : undefined,
            partner_role: p.partner_role,
            partner_contribution: p.partner_contribution
              ? Number(p.partner_contribution)
              : undefined,
          })),
        };
        Object.keys(payload).forEach((key) => {
          if ((payload as any)[key] === undefined) {
            delete (payload as any)[key];
          }
        });
        await updateProject(payload as any).unwrap();
        navigate("/projects");
      } catch (err: any) {
        let errorMessage = "Erreur inconnue";
        if (err.status === 500) {
          errorMessage =
            "Erreur serveur: Veuillez vérifier les logs du serveur Laravel";
        } else if (err.data?.errors) {
          errorMessage = Object.values(err.data.errors).flat().join("\n");
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

  if (projectLoading || optionsLoading) {
    return (
      <div className="p-8 text-center text-lg font-semibold text-blue-900">
        Chargement du projet...
      </div>
    );
  }
  if (isError || !p) {
    return (
      <div className="p-8 text-center text-lg font-semibold text-red-600">
        Erreur lors du chargement du projet.
      </div>
    );
  }

  return (
    <div className="p-8 font-nunito">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Modifier le projet"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Projets", url: "/projects" },
            { label: "Modifier", active: true },
          ]}
        />
      </div>
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations (Français) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Nom du projet
              </label>
              <Input
                ref={inputRefs.project_name}
                name="project_name"
                value={form.project_name}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
              {errors.project_name && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.project_name}
                </div>
              )}
            </div>
            <div>
              <label
                ref={inputRefs.responsible}
                className="block text-gray-700 font-semibold mb-2 text-left"
              >
                Responsable
              </label>
              <Combobox
                options={
                  formOptions?.users?.map((u: any) => ({
                    value: String(u.id),
                    label: u.name,
                  })) || []
                }
                value={form.responsible_id}
                onChange={(value) =>
                  handleChange({
                    target: { name: "responsible_id", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                placeholder="Sélectionner le responsable"
                disabled={optionsLoading}
              />
              {errors.responsible_id && <div className="text-red-500 text-xs mt-1">{errors.responsible_id}</div>}
            </div>
          </div>
          {/* Détails du projet */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label ref={inputRefs.project_type} className="block text-gray-700 font-semibold mb-2 text-left">Type de projet</label>
                <Combobox
                  options={formOptions?.project_types?.filter(Boolean).map((t: any) => ({ value: String(t.id), label: t.name })) || []}
                  value={form.project_type_id}
                  onChange={value => handleChange({ target: { name: 'project_type_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="Sélectionner le type de projet"
                  disabled={optionsLoading}
                />
                {errors.project_type_id && <div className="text-red-500 text-xs mt-1">{errors.project_type_id}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Nature du projet</label>
                <Combobox
                  options={formOptions?.project_nature_options?.map((n: string) => ({ value: n, label: n })) || []}
                  value={form.project_nature}
                  onChange={value => handleChange({ target: { name: 'project_nature', value } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="Sélectionner la nature"
                  disabled={optionsLoading}
                />
                {errors.project_nature && <div className="text-red-500 text-xs mt-1">{errors.project_nature}</div>}
              </div>
              <div>
                <label ref={inputRefs.project_status} className="block text-gray-700 font-semibold mb-2 text-left">Statut du projet</label>
                <Combobox
                  options={formOptions?.project_statuses?.filter(Boolean).map((s: any) => ({ value: String(s.id), label: s.name })) || []}
                  value={form.project_status_id}
                  onChange={value => handleChange({ target: { name: 'project_status_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="Sélectionner le statut"
                  disabled={optionsLoading}
                />
                {errors.project_status_id && <div className="text-red-500 text-xs mt-1">{errors.project_status_id}</div>}
              </div>
              <div>
                <label ref={inputRefs.start_date} className="block text-gray-700 font-semibold mb-2 text-left">Date de lancement</label>
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
                {dateErrors.start_date && <div className="text-red-500 text-xs mt-1">{dateErrors.start_date}</div>}
              </div>
              <div>
                <label ref={inputRefs.actual_start_date} className="block text-gray-700 font-semibold mb-2 text-left">Date de début réelle</label>
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
                {dateErrors.actual_start_date && <div className="text-red-500 text-xs mt-1">{dateErrors.actual_start_date}</div>}
              </div>
              <div>
                <label ref={inputRefs.end_date} className="block text-gray-700 font-semibold mb-2 text-left">Date de clôture</label>
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
                {dateErrors.end_date && <div className="text-red-500 text-xs mt-1">{dateErrors.end_date}</div>}
              </div>
            </div>
            {/* Détails Financiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Budget total</label>
                <Input
                  ref={inputRefs.total_budget}
                  name="total_budget"
                  type="number"
                  min={0}
                  value={form.total_budget}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="Montant en MAD"
                />
                <div className="text-xs text-gray-500 mt-1">Le budget est exprimé en MAD (Dirham marocain).</div>
                {errors.total_budget && <div className="text-red-500 text-xs mt-1">{errors.total_budget}</div>}
              </div>
              <div>
                <label ref={inputRefs.bank_account} className="block text-gray-700 font-semibold mb-2 text-left">Compte Bancaire de Projet</label>
                <Combobox
                  options={formOptions?.bank_accounts?.filter(Boolean).map((b: any) => ({ value: String(b.id), label: b.account_title })) || []}
                  value={form.project_bank_account_id}
                  onChange={value => handleChange({ target: { name: 'project_bank_account_id', value } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="Sélectionner le compte bancaire"
                  disabled={optionsLoading}
                />
                {errors.project_bank_account_id && <div className="text-red-500 text-xs mt-1">{errors.project_bank_account_id}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-left">Apport FZ (%)</label>
                <Input
                  ref={inputRefs.zakoura_contribution}
                  name="zakoura_contribution"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="% (0-100)"
                  value={form.zakoura_contribution}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                />
                {errors.zakoura_contribution && <div className="text-red-500 text-xs mt-1">{errors.zakoura_contribution}</div>}
              </div>
            </div>
            {/* Partners section */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                Partenaires
              </h3>
              <div className="flex flex-col gap-6">
                {partners.map((partner, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-4 relative shadow-sm"
                  >
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">
                          Nom du partenaire
                        </label>
                        <Combobox
                          options={
                            formOptions?.partners?.data?.map((p: any) => ({
                              value: String(p.id),
                              label: p.partner_name,
                            })) || []
                          }
                          value={partner.partner_id}
                          onChange={(value) =>
                            handlePartnerChange(idx, {
                              target: { name: "partner_id", value },
                            } as React.ChangeEvent<HTMLInputElement>)
                          }
                          placeholder="Sélectionner un partenaire"
                          disabled={optionsLoading}
                        />
                        {partnerErrors[idx]?.partner_id && (
                          <div className="text-red-500 text-xs mt-1">
                            {partnerErrors[idx].partner_id}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">
                          Rôle
                        </label>
                        <Combobox
                          options={
                            formOptions?.partner_roles
                              ? Object.entries(formOptions.partner_roles).map(
                                  ([key, label]) => ({
                                    value: String(label),
                                    label: label as string,
                                  })
                                )
                              : []
                          }
                          value={partner.partner_role}
                          onChange={(value) =>
                            handlePartnerChange(idx, {
                              target: { name: "partner_role", value },
                            } as React.ChangeEvent<HTMLInputElement>)
                          }
                          placeholder="Sélectionner un rôle"
                          disabled={optionsLoading}
                        />
                        {partnerErrors[idx]?.partner_role && (
                          <div className="text-red-500 text-xs mt-1">
                            {partnerErrors[idx].partner_role}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1 text-left">
                          % Apport Partenaire
                        </label>
                        <Input
                          name="partner_contribution"
                          placeholder="% (0-100)"
                          type="number"
                          min={0}
                          max={100}
                          value={partner.partner_contribution}
                          onChange={(e) => handlePartnerChange(idx, e)}
                          className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        />
                        {partnerErrors[idx]?.partner_contribution && (
                          <div className="text-red-500 text-xs mt-1">
                            {partnerErrors[idx].partner_contribution}
                          </div>
                        )}
                      </div>
                    </div>
                    {partners.length > 0 && (
                      <Button
                        type="button"
                        onClick={() => removePartner(idx)}
                        className=" text-red-500 text-xs font-semibold px-2 py-1 border border-red-200 rounded transition hover:bg-red-600 hover:text-white bg-white shadow"
                      >
                        <Trash2Icon />
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
                  <span className="text-xl leading-none">+</span> Ajouter un
                  partenaire
                </Button>
              </div>
            </div>
            {/* Notes et/ou observation */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Notes et/ou observation
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                rows={3}
              />
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
                onClick={() => navigate("/projects")}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 transition text-white px-8 py-2 rounded-lg font-semibold shadow"
                disabled={submitting}
              >
                {submitting ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
            )}
          </div>
        </form>
        {/* Modal for budget percentage check */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <div className="text-lg font-semibold text-red-500">
                Alerte budget
              </div>
            </DialogHeader>
            <div className="py-4 text-gray-800 text-center">{modalMessage}</div>
            <DialogFooter className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={handleModalCancel}
                type="button"
              >
                Annuler
              </Button>
              <Button
                onClick={handleModalConfirm}
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Show the sum of percentages with color */}
        <div
          className={`mt-2 text-center text-lg font-bold ${
            getTotalPercent().sum < 100
              ? "text-red-600"
              : getTotalPercent().sum > 100
              ? "text-green-600"
              : "text-gray-700"
          }`}
        >
          Total contributions: {getTotalPercent().sum.toFixed(2)}%
        </div>
      </Card>
    </div>
  );
};

export default EditProject;
