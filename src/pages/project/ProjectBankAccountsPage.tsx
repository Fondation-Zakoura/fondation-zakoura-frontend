import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useGetProjectBankAccountsQuery,
  useCreateProjectBankAccountMutation,
  useUpdateProjectBankAccountMutation,
  useDeleteProjectBankAccountMutation,
  useUpdateBankAccountSupportingDocumentMutation,
  useBulkDeleteProjectBankAccountsMutation,
  useRestoreProjectBankAccountMutation,
} from "@/features/api/projectsApi";
import type { ProjectBankAccount } from "@/features/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pen, Eye, Trash, RotateCcw, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import type { Column, ColumnFilter } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NewDataTable } from "@/components/ui/new-data-table";
import { useDebounce } from "@/hooks/useDebounce";
import { AddBankAccountModal } from "@/components/projectBankAccounts/AddBankAccountModal";
import dayjs from "dayjs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import countriesData from "@/data/countries.json";
import { UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyAccount: Omit<ProjectBankAccount, "supporting_document"> & {
  supporting_document: string | File;
} = {
  id: 0,
  rib_iban: "",
  agency: "",
  bank: "",
  account_title: "",
  opening_country: "",
  account_holder_name: "",
  bic_swift: "",
  opening_date: "",
  supporting_document: "",
  comments: "",
  status: "",
  currency: "",
  deleted_at: null,
};

const MOROCCAN_BANKS = [
  "Attijariwafa Bank",
  "Banque Populaire",
  "BMCE Bank (Bank of Africa)",
  "CIH Bank",
  "Crédit Agricole du Maroc",
  "Société Générale Maroc",
  "Crédit du Maroc",
  "Al Barid Bank",
  "Bank Al-Maghrib",
];

const CURRENCIES = ["MAD", "EUR", "USD"];

type FormType = typeof emptyAccount & { supporting_document: string | File };

const ProjectBankAccountsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string | string[]>>({ is_active: 'true' });
  const [dataTableKey, _setDataTableKey] = useState(0);
  const [pendingBulkDeleteIds, setPendingBulkDeleteIds] = useState<number[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const debouncedSearchCode = useDebounce(searchCode, 400);
  const { data: apiData, isLoading, refetch } = useGetProjectBankAccountsQuery({ 
    filters: { 
      ...filters, 
      page: String(page), 
      per_page: String(pageSize) 
    } 
  });
  
  // Debug: Log the filters being sent to the API
  console.log('API Filters:', { ...filters, page: String(page), per_page: String(pageSize) });
  const accounts: ProjectBankAccount[] = Array.isArray(apiData)
    ? apiData
    : apiData?.data || [];
  const total = Array.isArray(apiData) ? apiData.length : apiData?.total || 0;
  const perPage = Array.isArray(apiData) ? apiData.length : apiData?.per_page || pageSize;
  const currentPage = Array.isArray(apiData) ? 1 : apiData?.current_page || page;
  const [createAccount] = useCreateProjectBankAccountMutation();
  const [updateAccount] = useUpdateProjectBankAccountMutation();
  const [deleteAccount] = useDeleteProjectBankAccountMutation();
  const [updateBankAccountSupportingDocument] =
    useUpdateBankAccountSupportingDocumentMutation();
  const [bulkDeleteProjectBankAccounts, { isLoading: bulkDeleteLoading }] = useBulkDeleteProjectBankAccountsMutation();
  const [restoreProjectBankAccount, { isLoading: isRestoring }] = useRestoreProjectBankAccountMutation();
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const [modal, setModal] = useState<"add" | "edit" | "show" | null>(null);
  const [selected, setSelected] = useState<ProjectBankAccount | null>(null);
  const [form, setForm] = useState<FormType>({
    ...emptyAccount,
    supporting_document: "",
  });
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] =
    useState<ProjectBankAccount | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [_filePreview, setFilePreview] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDownload = async (filePath: string) => {
    try {
      const filename = filePath.split('/').pop() || 'document';
      
      console.log('File path:', filePath);
      console.log('Extracted filename:', filename);
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/download/project-file/${encodeURIComponent(filename)}`);
      
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/download/project-file/${encodeURIComponent(filename)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'Application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
    }
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, account_title: debouncedSearchCode }));
    setPage(1);
  }, [debouncedSearchCode]);

  const openAdd = () => {
    setForm(emptyAccount);
    setModal("add");
  };
  const openEdit = (account: ProjectBankAccount) => {
    console.log("Opening date from backend:", account.opening_date);
    setForm({
      ...account,
      status: normalizeStatus(account.status),
      supporting_document: account.supporting_document || "",
      opening_date: account.opening_date
        ? dayjs(account.opening_date).format("YYYY-MM-DD")
        : "",
    });
    setSelected(account);
    setModal("edit");
    setFilePreview(null);
    setRemoveExistingFile(false);
  };
  const handleBulkDelete = async () => {
    if (pendingBulkDeleteIds.length === 0) return;
    setBulkDeleteConfirmOpen(false);
    try {
      await bulkDeleteProjectBankAccounts(pendingBulkDeleteIds).unwrap();
      setPendingBulkDeleteIds([]);
      refetch();
      toast.success('Désactivation multiple réussie !');
    } catch (err: any) {
      toast.error(err.data?.message || 'Erreur lors de la désactivation multiple');
    }
  };
  const openShow = (account: ProjectBankAccount) => {
    setSelected(account);
    setModal("show");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyAccount);
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let updatedForm: FormType;
    if (e.target.type === "file") {
      updatedForm = {
        ...form,
        [e.target.name]:
          e.target.files && e.target.files[0] ? e.target.files[0] : "",
      };
    } else {
      updatedForm = { ...form, [e.target.name]: e.target.value };
    }
    setForm(updatedForm);
    setFieldErrors(validateForm(updatedForm));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);
    setFieldErrors(validateForm(updatedForm));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm({ ...form, supporting_document: file as File });
      setRemoveExistingFile(false);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(file.name);
      }
    }
  };

  const handleRemoveFile = () => {
    setForm({ ...form, supporting_document: "" });
    setFilePreview(null);
    setRemoveExistingFile(true);
  };

  function validateForm(form: FormType) {
    const errors: { [key: string]: string } = {};
    // Required fields
    const requiredFields: (keyof FormType)[] = [
      "rib_iban",
      "agency",
      "bank",
      "account_title",
      "opening_country",
      "account_holder_name",
      "bic_swift",
      "currency",
      "status",
    ];
    requiredFields.forEach((field) => {
      const value = form[field as keyof FormType];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field as string] = "Ce champ est requis.";
      }
    });
    // rib_iban length
    if (
      form.rib_iban &&
      (form.rib_iban.length < 24 || form.rib_iban.length > 34)
    ) {
      errors.rib_iban = "Le RIB/IBAN doit contenir entre 24 et 34 caractères.";
    }
    // bic_swift format
    if (
      form.bic_swift &&
      !/^[A-Za-z0-9]{8}(?:[A-Za-z0-9]{3})?$/.test(form.bic_swift)
    ) {
      errors.bic_swift =
        "Le BIC/SWIFT doit contenir 8 ou 11 caractères alphanumériques.";
    }
    // supporting_document type and size
    if (
      form.supporting_document &&
      typeof form.supporting_document !== "string"
    ) {
      const file = form.supporting_document as File;
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        errors.supporting_document =
          "Le fichier doit être un PDF ou une image.";
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.supporting_document =
          "La taille maximale du fichier est de 5 Mo.";
      }
    }
    return errors;
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAddLoading(true);
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setAddLoading(false);
      return;
    }
    try {
      console.log("Submitting form:", form);
      const isFile =
        form.supporting_document &&
        typeof form.supporting_document !== "string";

      let payload: any;
      if (isFile) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (
            key === "supporting_document" &&
            value &&
            typeof value !== "string"
          ) {
            payload.append(key, value as File);
          } else {
            payload.append(key, String(value ?? ""));
          }
        });
      } else {
        payload = { ...form, supporting_document: "" };
      }

      await createAccount(payload).unwrap();
      toast.success('Compte bancaire créé avec succès !');
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || "Erreur lors de la création");
      toast.error(err.data?.message || 'Erreur lors de la création');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEditLoading(true);
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setEditLoading(false);
      return;
    }
    if (!selected) {
      setEditLoading(false);
      return;
    }
    try {
      console.log("Submitting form:", form);
      const isFile =
        form.supporting_document &&
        typeof form.supporting_document !== "string";
      // 1. Update non-file fields
      let payload: any = { ...form };
      delete payload.supporting_document;
      await updateAccount({
        id: Number(selected.id),
        body: payload,
      }).unwrap();
      // 2. If a new file is uploaded, update supporting document
      if (isFile) {
        const formData = new FormData();
        formData.append(
          "supporting_document",
          form.supporting_document as File
        );
        await updateBankAccountSupportingDocument({
          id: Number(selected.id),
          formData,
        }).unwrap();
      } else if (removeExistingFile) {
        // If file was removed, send empty string to supporting-document endpoint
        const formData = new FormData();
        formData.append("supporting_document", "");
        await updateBankAccountSupportingDocument({
          id: Number(selected.id),
          formData,
        }).unwrap();
      }
      toast.success('Compte bancaire modifié avec succès !');
      closeModal();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || "Erreur lors de la modification");
      toast.error(err.data?.message || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(accountToDelete.id!).unwrap();
      toast.success('Compte bancaire désactivé avec succès !');
      setAccountToDelete(null);
      refetch();
      setConfirmDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Erreur lors de la désactivation');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columnFilters = useMemo((): ColumnFilter[] => {

    return [
      {
        id: "bank",
        label: "Banque",
        options: MOROCCAN_BANKS.map((bank) => ({ value: bank, label: bank })),
      },
      {
        id: "status",
        label: "Statut",
        options: [
          { value: "active", label: "Actif" },
          { value: "inactive", label: "Inactif" },
          { value: "closed", label: "Fermé" },
        ],
      },
      {
        id: 'is_active',
        label: 'Active',
        options: [
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ],
      },
    ];
  }, [accounts]);

  // Add a helper for status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: Column<ProjectBankAccount>[] = [
    { key: "account_title", header: "Intitulé du compte", sortable: true },
    { key: "account_holder_name", header: "Nom du titulaire", sortable: true },
    { key: "bank", header: "Banque", sortable: true },
    { key: "opening_country", header: "Pays d'ouverture", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow ${getStatusBadgeClass(
            row.status
          )}`}
        >
          {row.status?.toLowerCase() === 'active' 
            ? 'Actif' 
            : row.status?.toLowerCase() === 'inactive'
            ? 'Inactif'
            : row.status?.toLowerCase() === 'closed'
            ? 'Fermé'
            : row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => openShow(row)}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
            title="Voir"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="p-2 rounded hover:bg-blue-100 text-blue-600"
            title="Éditer"
          >
            <Pen size={16} />
          </button>
          {row.deleted_at ? (
            restoringId === row.id && isRestoring ? (
              <span className="loader mr-2" />
            ) : (
              <button
                onClick={async () => {
                  setRestoringId(row.id);
                  try {
                    await restoreProjectBankAccount(row.id);
                    refetch();
                    toast.success('Compte bancaire restauré avec succès !');
                  } finally {
                    setRestoringId(null);
                  }
                }}
                className="p-2 rounded hover:bg-green-100 text-green-600"
                title="Restaurer"
                disabled={isRestoring && restoringId === row.id}
              >
                <RotateCcw size={16} />
              </button>
            )
          ) : (
            <button
              onClick={() => {
                setAccountToDelete(row);
                setConfirmDeleteOpen(true);
              }}
              className="p-2 rounded hover:bg-red-100 text-red-600"
              title="Désactiver"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  function normalizeStatus(status: string) {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "active" || s === "actif") return "active";
    if (s === "inactive" || s === "inactif") return "inactive";
    if (s === "closed" || s === "fermé") return "closed";
    return s;
  }



  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Comptes bancaires"
          breadcrumbs={[
            { label: "Parametres" },
            { label: "Projets", url: "/projects" },
            { label: "Comptes bancaires", active: true },
          ]}
        ></PageHeaderLayout>
        <Button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 bg-[#19376D] hover:bg-[#19386df9] text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow"
          disabled={addLoading}
        >
          <Plus className="w-4 h-4" />{" "}
          {addLoading ? <span className="loader mr-2"></span> : null} Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <NewDataTable
          globalSearchPlaceholder={'Rechercher par l\'intitulé de compte'}
          globalSearchLabel={'Intitulé du compte'}
          key={dataTableKey}
            columns={columns}
            data={accounts}
            hoverEffect
            emptyText={
              isLoading
                ? "Chargement des données..."
                : "Aucun Compte bancaire trouvé"
            }
            headerStyle={"primary"}
            striped
            initialPageSize={pageSize}
            columnFilters={columnFilters}
            enableBulkDelete={false}
            serverPagination={true}
            pageCount={Math.ceil(total / perPage)}
            pageIndex={currentPage - 1}
            pageSize={perPage}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setPage(pageIndex + 1);
              if (pageSize) setPageSize(pageSize);
            }}
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            globalSearchTerm={searchCode}
            onGlobalSearchChange={(value) => {
              setSearchCode(value);
            }}
          />
          
        )}
      </div>
      {/* Add Modal */}
      <AddBankAccountModal
        open={modal === "add"}
        onClose={closeModal}
        onSubmit={handleAdd}
        form={form}
        onChange={handleChange}
        onTextareaChange={handleTextareaChange}
        onFileChange={handleFileChange}
        fieldErrors={fieldErrors}
        error={error}
        loading={addLoading}
        moroccanBanks={MOROCCAN_BANKS}
        currencies={CURRENCIES}
      />
      {/* Edit Modal */}
      <Dialog open={modal === "edit"} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le compte bancaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="rib_iban">
                  RIB / IBAN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rib_iban"
                  name="rib_iban"
                  placeholder="RIB / IBAN"
                  value={form.rib_iban}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.rib_iban && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.rib_iban}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="agency">
                  Agence <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agency"
                  name="agency"
                  placeholder="Agence"
                  value={form.agency}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.agency && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.agency}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="bank">
                  Banque <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.bank}
                  onValueChange={(value) => setForm({ ...form, bank: value })}
                >
                  <SelectTrigger className="w-full" id="bank" name="bank">
                    <SelectValue placeholder="Banque" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOROCCAN_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.bank && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.bank}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="account_title">
                  Intitulé du compte <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_title"
                  name="account_title"
                  placeholder="Intitulé du compte"
                  value={form.account_title}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.account_title && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.account_title}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="account_holder_name">
                  Nom du titulaire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_holder_name"
                  name="account_holder_name"
                  placeholder="Nom du titulaire"
                  value={form.account_holder_name}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.account_holder_name && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.account_holder_name}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="bic_swift">BIC / SWIFT</Label>
                <Input
                  id="bic_swift"
                  name="bic_swift"
                  placeholder="BIC / SWIFT"
                  value={form.bic_swift}
                  onChange={handleChange}
                />
                {fieldErrors.bic_swift && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.bic_swift}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="opening_date">Date d'ouverture</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative w-full">
                      <Input
                        id="opening_date"
                        name="opening_date"
                        placeholder="jj/mm/aaaa"
                        value={form.opening_date ? dayjs(form.opening_date).format("DD/MM/YYYY") : ""}
                        readOnly
                        className="pr-10 cursor-pointer bg-white"
                      />
                      <CalendarIcon
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.opening_date ? dayjs(form.opening_date).toDate() : undefined}
                      onSelect={date => {
                        if (date) {
                          const iso = dayjs(date).format("YYYY-MM-DD");
                          handleChange({ target: { name: "opening_date", value: iso } } as any);
                        }
                      }}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear() + 5}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="opening_country">Pays d'ouverture <span className="text-red-500">*</span></Label>
                <Combobox
                  options={countriesData.map((c: { code: string; name: string }) => ({ value: c.name, label: c.name }))}
                  value={form.opening_country}
                  onChange={value => handleChange({ target: { name: "opening_country", value } } as any)}
                  placeholder="Pays d'ouverture"
                />
                {fieldErrors.opening_country && <span className="text-xs text-red-500">{fieldErrors.opening_country}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="currency">
                  Devise <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) =>
                    setForm({ ...form, currency: value })
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    id="currency"
                    name="currency"
                  >
                    <SelectValue placeholder="Devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.currency && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.currency}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger className="w-full" id="status" name="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.status && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.status}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="supporting_document">
                  Pièce justificative (Scan)
                </Label>
                <SupportingDocumentDropzone
                  value={form.supporting_document}
                  onFileChange={handleFileChange}
                  error={fieldErrors.supporting_document}
                  existingFile={typeof form.supporting_document === "string" && form.supporting_document ? form.supporting_document : null}
                  onRemoveExisting={handleRemoveFile}
                  removeExistingFile={removeExistingFile}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="comments">Commentaires / Remarques</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  placeholder="Commentaires / Remarques"
                  value={form.comments}
                  onChange={handleTextareaChange}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#576CBC] hover:bg-[#19376D] text-white"
                disabled={editLoading}
              >
                {editLoading ? <span className="loader mr-2"></span> : null}{" "}
                Enregistrer
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
            {/* Show Modal */}
      <Dialog open={modal === "show"} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Détails du compte bancaire
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informations complètes du compte bancaire
            </DialogDescription>
          </DialogHeader>
          
          {selected && (
            <div className="py-6">
              {/* RIB/IBAN Section - Full Width */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                  RIB / IBAN
                </h3>
                <div className="bg-white p-4 rounded-md border border-gray-300">
                  <span className="font-mono text-lg text-gray-900 break-all">
                    {selected.rib_iban}
                  </span>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Agence
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.agency || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Banque
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.bank || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Intitulé du compte
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.account_title || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Nom du titulaire
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.account_holder_name || "Non spécifié"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      BIC / SWIFT
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.bic_swift || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Date d'ouverture
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.opening_date || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Pays d'ouverture
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.opening_country || "Non spécifié"}
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Devise
                    </label>
                    <span className="text-gray-900 font-medium">
                      {selected.currency || "Non spécifié"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Statut du compte
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selected.status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selected.status?.toLowerCase() === 'inactive'
                      ? 'bg-orange-100 text-orange-800'
                      : selected.status?.toLowerCase() === 'closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selected.status?.toLowerCase() === 'active' 
                      ? 'Actif' 
                      : selected.status?.toLowerCase() === 'inactive'
                      ? 'Inactif'
                      : selected.status?.toLowerCase() === 'closed'
                      ? 'Fermé'
                      : selected.status?.charAt(0).toUpperCase() + selected.status?.slice(1) || "Non spécifié"}
                  </span>
                </div>
              </div>

              {/* Supporting Document Section */}
              <div className="mb-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Pièce justificative
                  </label>
                  {selected.supporting_document ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <span className="text-sm text-gray-600">
                          Document disponible
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(selected.supporting_document)}
                        className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        title="Télécharger le document"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <span className="text-sm text-gray-500">
                        Aucun document joint
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              {selected.comments && (
                <div className="mb-8">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Commentaires / Remarques
                    </label>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <span className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selected.comments}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="border-t border-gray-200 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="px-6">
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la désactivation multiple</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver les comptes bancaires sélectionnés ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
              {bulkDeleteLoading ? <span className="loader mr-2"></span> : null} Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Modal for single delete */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la désactivation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver ce compte bancaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? <span className="loader mr-2"></span> : null} Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <style>{`
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}</style>
    </div>
  );
};

interface SupportingDocumentDropzoneProps {
  value: File | string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  existingFile?: string | null;
  onRemoveExisting?: () => void;
  removeExistingFile?: boolean;
}

const SupportingDocumentDropzone: React.FC<SupportingDocumentDropzoneProps> = ({ 
  value, 
  onFileChange, 
  error, 
  existingFile, 
  onRemoveExisting, 
  removeExistingFile 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (value && typeof value !== "string" && value.type.startsWith("image/")) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInputEvent = {
        target: {
          name: "supporting_document",
          files: e.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(fileInputEvent);
    }
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const emptyEvent = {
      target: {
        name: "supporting_document",
        files: null,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onFileChange(emptyEvent);
    setPreviewUrl(null);
  };

  const handleRemoveExisting = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveExisting) {
      onRemoveExisting();
    }
  };

  return (
    <div>
      <input
        id="supporting_document"
        type="file"
        accept="application/pdf,image/*"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div
        className={cn(
          "relative w-full h-32 border-2 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary-foreground" : "border-gray-300 hover:border-primary"
        )}
        style={{ width: "100%" }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Document Preview"
              className="max-h-full max-w-full object-contain p-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full"
              title="Supprimer le fichier"
            >
              <XCircle size={20} />
            </Button>
          </>
        ) : value && typeof value !== "string" ? (
          <>
            {value.type === "application/pdf" ? (
              <>
                <UploadCloud size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{value.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full"
                  title="Supprimer le fichier"
                >
                  <XCircle size={20} />
                </Button>
              </>
            ) : null}
          </>
        ) : existingFile && !removeExistingFile ? (
          <>
            {/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(existingFile) ? (
              <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${existingFile}`}
                alt="Pièce justificative"
                className="max-h-full max-w-full object-contain p-1"
              />
            ) : (
              <>
                <UploadCloud size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Document existant</p>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveExisting}
              className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full"
              title="Supprimer le fichier"
            >
              <XCircle size={20} />
            </Button>
          </>
        ) : (
          <>
            <UploadCloud size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Sélectionnez ou déposez un fichier</p>
            <p className="text-xs text-gray-400">(PDF, PNG, JPEG, SVG - max 5MB)</p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default ProjectBankAccountsPage;
