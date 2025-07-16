import React, { useState } from "react";
import {
  useGetProjectStatusesQuery,
  useCreateProjectStatusMutation,
  useUpdateProjectStatusMutation,
  useDeleteProjectStatusMutation,
} from "@/features/api/projectsApi";
import type { ProjectStatus } from "@/features/types/project";
import { Button } from "@/components/ui/button";
import { PageHeaderLayout } from "@/layouts/MainLayout";
import { DataTable, type Column } from "@/components/ui/data-table";
import { AddProjectStatusModal } from "@/components/projectStatuses/AddProjectStatusModal";
import { EditProjectStatusModal } from "@/components/projectStatuses/EditProjectStatusModal";
import { ShowProjectStatusModal } from "@/components/projectStatuses/ShowProjectStatusModal";
import { DeleteProjectStatusModal } from "@/components/projectStatuses/DeleteProjectStatusModal";
import { Eye, Pen, Plus, Trash } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const emptyStatus: ProjectStatus = { id: 0, name: "" };

const ProjectStatusesPage: React.FC = () => {
  const {
    data: statuses = [],
    isLoading,
    refetch,
  } = useGetProjectStatusesQuery();
  const [createStatus] = useCreateProjectStatusMutation();
  const [updateStatus] = useUpdateProjectStatusMutation();
  const [deleteStatus] = useDeleteProjectStatusMutation();

  const [modal, setModal] = useState<"add" | "edit" | "show" | null>(null);
  const [selected, setSelected] = useState<ProjectStatus | null>(null);
  const [form, setForm] = useState(emptyStatus);
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<ProjectStatus | null>(
    null
  );

  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAdd = () => {
    setForm(emptyStatus);
    setModal("add");
  };
  const openEdit = (status: ProjectStatus) => {
    setForm(status);
    setSelected(status);
    setModal("edit");
  };
  const openShow = (status: ProjectStatus) => {
    setSelected(status);
    setModal("show");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyStatus);
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
      await createStatus({ name: form.name }).unwrap();
      toast.success('Statut de projet créé avec succès !');
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
      await updateStatus({
        id: selected.id,
        body: { name: form.name },
      }).unwrap();
      toast.success('Statut de projet modifié avec succès !');
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
    if (!statusToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteStatus(statusToDelete.id).unwrap();
      toast.success('Statut de projet supprimé avec succès !');
      setConfirmDeleteOpen(false);
      setStatusToDelete(null);
      refetch();
      setDeleteLoading(false);
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors de la suppression");
      toast.error(err.data?.message || 'Erreur lors de la suppression');
      setDeleteLoading(false);
    }
  };

  const columns: Column<ProjectStatus>[] = [
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
              setStatusToDelete(row);
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
    <div className="p-8 ">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Statuts de projet"
          breadcrumbs={[
            { label: "Parametres" },
            { label: "Finance" },
            { label: "Status" },
            { label: "Statuts de projet", active: true },
          ]}
        ></PageHeaderLayout>
        <Button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2  text-white font-bold px-6 py-2 rounded-lg shadow"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable columns={columns} data={statuses} hoverEffect />
        )}
      </div>
      {/* Add Modal */}
      <AddProjectStatusModal
        open={modal === "add"}
        onClose={closeModal}
        onSubmit={handleAdd}
        form={form}
        onChange={handleChange}
        error={error}
        loading={addLoading}
      />
      {/* Edit Modal */}
      <EditProjectStatusModal
        open={modal === "edit"}
        onClose={closeModal}
        onSubmit={handleEdit}
        form={form}
        onChange={handleChange}
        error={error}
        loading={editLoading}
      />
      {/* Show Modal */}
      <ShowProjectStatusModal
        open={modal === "show"}
        onClose={closeModal}
        selected={selected}
      />
      {/* Delete Modal */}
      <DeleteProjectStatusModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onDelete={handleDelete}
        loading={deleteLoading}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default ProjectStatusesPage;
