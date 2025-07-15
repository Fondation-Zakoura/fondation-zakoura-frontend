import React, { useState, useMemo } from "react";
import {
  useGetProjectBankAccountsQuery,
  useCreateProjectBankAccountMutation,
  useUpdateProjectBankAccountMutation,
  useDeleteProjectBankAccountMutation,
  useUpdateBankAccountSupportingDocumentMutation,
} from "@/features/api/projectsApi";
import type { ProjectBankAccount } from "@/features/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pen, Eye, Trash } from "lucide-react";
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
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const { data: apiData, isLoading, refetch } = useGetProjectBankAccountsQuery();
  const accounts: ProjectBankAccount[] = Array.isArray(apiData)
    ? apiData as ProjectBankAccount[]
    : apiData && "data" in (apiData as { data: ProjectBankAccount[] })
      ? (apiData as { data: ProjectBankAccount[] }).data
      : [];
  console.log(accounts);
  const [createAccount] = useCreateProjectBankAccountMutation();
  const [updateAccount] = useUpdateProjectBankAccountMutation();
  const [deleteAccount] = useDeleteProjectBankAccountMutation();
  const [updateBankAccountSupportingDocument] =
    useUpdateBankAccountSupportingDocumentMutation();

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
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAdd = () => {
    setForm(emptyAccount);
    setModal("add");
  };
  console.log(accounts);
  const openEdit = (account: ProjectBankAccount) => {
    setForm({
      ...account,
      status: normalizeStatus(account.status),
      supporting_document: account.supporting_document || "",
    });
    setSelected(account);
    setModal("edit");
    setFilePreview(null);
    setRemoveExistingFile(false);
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

  const handleDelete = async (account: ProjectBankAccount) => {
    if (!window.confirm("Supprimer ce compte bancaire ?")) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(account.id!).unwrap();
      toast.success('Compte bancaire supprimé avec succès !');
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columnFilters = useMemo((): ColumnFilter[] => {
    const uniqueRibs = Array.from(
      new Set(accounts.map((a: { rib_iban: any }) => a.rib_iban))
    );
    const uniqueAgencies = Array.from(
      new Set(accounts.map((a: { agency: any }) => a.agency))
    );
    const uniqueBanks = Array.from(
      new Set(accounts.map((a: { bank: any }) => a.bank))
    );

    return [
      {
        id: "rib_iban",
        label: "RIB / IBAN",
        options: uniqueRibs.map((rib) => ({ value: String(rib), label: String(rib) })),
      },
      {
        id: "agency",
        label: "Agence",
        options: uniqueAgencies.map((agency) => ({ value: String(agency), label: String(agency) })),
      },
      {
        id: "bank",
        label: "Banque",
        options: uniqueBanks.map((bank) => ({ value: String(bank), label: String(bank) })),
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
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
          <button
            onClick={() => {
              setAccountToDelete(row);
              setConfirmDeleteOpen(true);
            }}
            className="p-2 rounded hover:bg-red-100 text-red-600"
            title="Supprimer"
          >
            <Trash size={16} />
          </button>
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
          <DataTable
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
            initialPageSize={10}
            columnFilters={columnFilters}
          />
        )}
      </div>
      {/* Add Modal */}
      <Dialog open={modal === "add"} onOpenChange={closeModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un compte bancaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
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
                <Input
                  id="opening_date"
                  type="date"
                  name="opening_date"
                  placeholder="Date d'ouverture"
                  value={form.opening_date}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="opening_country">
                  Pays d'ouverture <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="opening_country"
                  type="text"
                  name="opening_country"
                  placeholder="Pays d'ouverture"
                  value={form.opening_country}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.opening_country && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.opening_country}
                  </span>
                )}
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
              <div className="flex flex-col gap-1">
                <Label htmlFor="supporting_document">
                  Pièce justificative (Scan)
                </Label>
                <Input
                  id="supporting_document"
                  name="supporting_document"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleChange}
                />
                {fieldErrors.supporting_document && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.supporting_document}
                  </span>
                )}
                {form.supporting_document &&
                  typeof form.supporting_document !== "string" &&
                  (form.supporting_document as File).name && (
                    <span className="text-xs text-gray-600 mt-1">
                      Fichier sélectionné :{" "}
                      {(form.supporting_document as File).name}
                    </span>
                  )}
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
                className=" text-white"
                disabled={addLoading}
              >
                {addLoading ? <span className="loader mr-2"></span> : null}{" "}
                Ajouter
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
                <Input
                  id="opening_date"
                  type="date"
                  name="opening_date"
                  placeholder="Date d'ouverture"
                  value={form.opening_date}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="opening_country">
                  Pays d'ouverture <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="opening_country"
                  type="text"
                  name="opening_country"
                  placeholder="Pays d'ouverture"
                  value={form.opening_country}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.opening_country && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.opening_country}
                  </span>
                )}
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
              <div className="flex flex-col gap-1">
                <Label htmlFor="supporting_document">
                  Pièce justificative (Scan)
                </Label>
                {/* Preview for new file */}
                {filePreview && typeof form.supporting_document !== "string" ? (
                  <div className="relative flex items-center gap-2 mb-2">
                    {typeof form.supporting_document !== "string" &&
                    "type" in form.supporting_document &&
                    form.supporting_document.type.startsWith("image/") ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-sm">{filePreview}</span>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      &#10005;
                    </button>
                  </div>
                ) : null}

                {/* Preview for existing file if no new file selected */}
                {!filePreview &&
                  typeof form.supporting_document === "string" &&
                  form.supporting_document &&
                  !removeExistingFile && (
                    <div className="relative flex items-center gap-2 mb-2">
                      {/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(
                        form.supporting_document
                      ) ? (
                        <img
                          src={`http://localhost:8000/storage/${form.supporting_document}`}
                          alt="Pièce justificative"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      ) : /\.pdf$/i.test(form.supporting_document) ? (
                        <a
                          href={`http://localhost:8000/storage/${form.supporting_document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-2 block"
                        >
                          Voir le document PDF
                        </a>
                      ) : (
                        <a
                          href={`http://localhost:8000/storage/${form.supporting_document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-2 block"
                        >
                          Télécharger le fichier
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Supprimer"
                      >
                        &#10005;
                      </button>
                    </div>
                  )}

                {/* File input */}
                {!filePreview &&
                  (!form.supporting_document || removeExistingFile) && (
                    <>
                      <span className="text-xs text-gray-500 mb-1">
                        Aucun document. Veuillez en ajouter un :
                      </span>
                      <Input
                        id="supporting_document"
                        name="supporting_document"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                {fieldErrors.supporting_document && (
                  <span className="text-xs text-red-500">
                    {fieldErrors.supporting_document}
                  </span>
                )}
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail du compte bancaire</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-500">RIB / IBAN</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.rib_iban}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Agence</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.agency}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Banque</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.bank}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">
                  Intitulé du compte
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.account_title}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">
                  Nom du titulaire
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.account_holder_name}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">BIC / SWIFT</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.bic_swift}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">
                  Date d'ouverture
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.opening_date}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">
                  Pays d'ouverture
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.opening_country}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Devise</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.currency}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Status</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {selected.status}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs text-gray-500">
                  Pièce justificative (Scan)
                </span>
                {selected.supporting_document ? (
                  (() => {
                    const url = `http://localhost:8000/storage/${selected.supporting_document}`;
                    console.log(url);
                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(
                      selected.supporting_document
                    );
                    const isPDF = /\.pdf$/i.test(selected.supporting_document);

                    if (isImage) {
                      return (
                        <Card className="w-fit max-w-sm shadow-lg rounded-2xl">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold">
                              Pièce justificative
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={url}
                              alt="Pièce justificative"
                              className="rounded-xl border shadow-sm object-cover max-h-96 w-full"
                            />
                          </CardContent>
                        </Card>
                      );
                    }

                    if (isPDF) {
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-2 block"
                        >
                          Voir le document PDF
                        </a>
                      );
                    }
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-2 block"
                      >
                        Télécharger le fichier
                      </a>
                    );
                  })()
                ) : (
                  <span className="font-semibold text-gray-800 text-sm break-all">
                    Aucun document
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs text-gray-500">
                  Commentaires / Remarques
                </span>
                <span className="font-semibold text-gray-800 text-sm break-all">
                  {selected.comments}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={async () => {
                if (accountToDelete) {
                  await handleDelete(accountToDelete);
                  setConfirmDeleteOpen(false);
                  setAccountToDelete(null);
                }
              }}
            >
              {deleteLoading ? <span className="loader mr-2"></span> : null}{" "}
              Supprimer
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

export default ProjectBankAccountsPage;
