import React, { useState } from "react";
import {
  useGetProjectTypesQuery,
  useCreateProjectTypeMutation,
  useUpdateProjectTypeMutation,
  useDeleteProjectTypeMutation,
} from "@/features/api/projectsApi";
import type { ProjectType } from "@/features/types/project";
import { Button } from "@/components/ui/button";
import { Plus, Pen, Eye, Trash} from "lucide-react";

import { PageHeaderLayout } from "@/layouts/MainLayout";
import { DataTable, type Column } from "@/components/ui/data-table";
import { AddProjectTypeModal } from "@/components/projectTypes/AddProjectTypeModal";
import { EditProjectTypeModal } from "@/components/projectTypes/EditProjectTypeModal";
import { ShowProjectTypeModal } from "@/components/projectTypes/ShowProjectTypeModal";
import { DeleteProjectTypeModal } from "@/components/projectTypes/DeleteProjectTypeModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const emptyType: ProjectType = { id: 0, name: "" };

const ProjectTypesPage: React.FC = () => {
  const { data: types = [], isLoading, refetch } = useGetProjectTypesQuery();
  const [createType] = useCreateProjectTypeMutation();
  const [updateType] = useUpdateProjectTypeMutation();
  const [deleteType] = useDeleteProjectTypeMutation();

  const [modal, setModal] = useState<"add" | "edit" | "show" | null>(null);
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [form, setForm] = useState(emptyType);
  const [error, setError] = useState("");
  const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const openAdd = () => {
    setForm(emptyType);
    setModal("add");
  };
  const openEdit = (type: ProjectType) => {
    setForm(type);
    setSelected(type);
    setModal("edit");
  };
  const openShow = (type: ProjectType) => {
    setSelected(type);
    setModal("show");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyType);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAddLoading(true);
    try {
      await createType({ name: form.name }).unwrap();
      toast.success('Type de projet créé avec succès !');
      closeModal();
      refetch();
      setAddLoading(false);
    } catch (err: any) {
      setError(err.data?.message || "Erreur lors de la création");
      toast.error(err.data?.message || 'Erreur lors de la création');
      setAddLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selected) return;
    setEditLoading(true);
    try {
      await updateType({ id: selected.id, body: { name: form.name } }).unwrap();
      toast.success('Type de projet modifié avec succès !');
      closeModal();
      refetch();
      setEditLoading(false);
    } catch (err: any) {
      setError(err.data?.message || "Erreur lors de la modification");
      toast.error(err.data?.message || 'Erreur lors de la modification');
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteType(typeToDelete.id).unwrap();
      toast.success('Type de projet supprimé avec succès !');
      refetch();
      setConfirmDeleteOpen(false);
      setTypeToDelete(null);
      setDeleteLoading(false);
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors de la suppression");
      toast.error(err.data?.message || 'Erreur lors de la suppression');
      setDeleteLoading(false);
    }
  };
  const columns: Column<ProjectType>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "created_at",
      header: "Date de creation",
      sortable: true,
      render: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("fr-FR")
          : "-",
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
            className="p-2 rounded hover:bg-red-100 text-red-600"
            title="Supprimer"
            onClick={() => {
              setTypeToDelete(row);
              setConfirmDeleteOpen(true);
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Types de projet"
          breadcrumbs={[
            { label: "Parametres" },
            { label: "Finance" },
            { label: "Types" },
            { label: "Types de projet", active: true },
          ]}
        ></PageHeaderLayout>
        <Button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 bg-[#19376D]  text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable columns={columns} data={types} />
        )}
      </div>
      {/* Add Modal */}
      <AddProjectTypeModal
        open={modal === "add"}
        onClose={closeModal}
        onSubmit={handleAdd}
        form={form}
        onChange={handleChange}
        error={error}
        loading={addLoading}
      />
      {/* Edit Modal */}
      <EditProjectTypeModal
        open={modal === "edit"}
        onClose={closeModal}
        onSubmit={handleEdit}
        form={form}
        onChange={handleChange}
        error={error}
        loading={editLoading}
      />
      {/* Show Modal */}
      <ShowProjectTypeModal
        open={modal === "show"}
        onClose={closeModal}
        selected={selected}
      />
      {/* Delete Modal */}
      <DeleteProjectTypeModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onDelete={handleDelete}
        loading={deleteLoading}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default ProjectTypesPage;
