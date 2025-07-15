import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Plus, Trash, Pen, Eye } from "lucide-react";
import {
  DataTable,
  type Column,
  type ColumnFilter,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  useGetProjectsQuery,
  useBulkDeleteProjectsMutation,
  useGetProjectFormOptionsQuery,
} from "@/features/api/projectsApi";
import type {
  Project,
  ProjectStatus,
  ProjectType,
} from "@/features/types/project";
import { useNavigate } from "react-router-dom";
import { PageHeaderLayout } from "@/layouts/MainLayout";

function Projects() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState("");
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [pendingBulkDeleteIds, setPendingBulkDeleteIds] = useState<number[]>(
    []
  );
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetProjectsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize
  });


  const [bulkDeleteProjects] = useBulkDeleteProjectsMutation();

  const projects: (Project & { partners?: any[] })[] = data?.data || [];

  const handleShow = (id: number) => {
    navigate(`/projects/${id}`);
  };
  const handleDelete = (id: number) => {
    setProjectToDelete(projects.find((p) => p.id === id) || null);
    setConfirmDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteProjects([projectToDelete.id]).unwrap();
      refetch();
      setProjectToDelete(null);
      setConfirmDeleteOpen(false);
      setBulkDeleteMessage("Projet supprimé avec succès.");
      setBulkDeleteModalOpen(true);
    } catch (error) {
      setBulkDeleteMessage("Erreur lors de la suppression du projet.");
      setBulkDeleteModalOpen(true);
    } finally {
      setBulkDeleting(false);
    }
  };

  const columns: Column<Project & { partners?: any[] }>[] = [
    { key: "project_name", header: "Nom du Projet", sortable: true },
    { key: "project_code", header: "Code du Projet", sortable: true },

    {
      key: "partners",
      header: "Partenaires",
      render: (row: Project & { partners?: any[] }) => (
        <div className="flex flex-wrap gap-2">
          {row.partners?.map((partner: any, idx: number) => (
            <Button
              key={partner.id || idx}
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPartner(partner);
                setPartnerModalOpen(true);
              }}
              className="rounded-full border border-blue-200 bg-blue-50 text-blue-900 px-3 py-1 text-xs font-medium cursor-pointer hover:bg-blue-100 transition"
            >
              {partner.partner_name || partner.name}
              {partner.pivot?.partner_role
                ? ` (${partner.pivot.partner_role})`
                : ""}
            </Button>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleShow(row.id);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            className="p-2 rounded hover:bg-blue-100 text-blue-600"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${row.id}/edit`);
            }}
          >
            <Pen size={16} />
          </Button>
          <Button
            variant="ghost"
            className="p-2 rounded hover:bg-red-100 text-red-600"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
      sortable: false,
    },
  ];

  const { data: options } = useGetProjectFormOptionsQuery();
  const columnFilters = useMemo((): ColumnFilter[] => {
    return [
      {
        id: "project_type_id",
        label: "Type du Projet",
        options:
          options?.project_statuses.map((type: ProjectType) => ({
            value: type.id,
            label: type.name,
          })) || [],
      },
      {
        id: "project_status_id",
        label: "Statut",
        options:
          options?.project_types.map((status: ProjectStatus) => ({
            value: status.id,
            label: status.name,
          })) || [],
      },
      {
        id: "project_nature",
        label: "Nature de Projet",
        options: Array.from(
          new Set(options?.project_nature_options.filter(Boolean))
        ).map((n) => ({
          value: String(n),
          label: String(n),
        })),
      },
    ];
  }, [options, projects]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Chargement des projets...
      </div>
    );
  if (isError)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        Erreur lors du chargement des projets. Veuillez réessayer.
      </div>
    );

  return (
    <>
      <div className="p-8 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <PageHeaderLayout
            title="Liste des projets"
            breadcrumbs={[
              { label: "Tableaux de bord" },
              { label: "Projets", active: true },
            ]}
          />
          <Button
            onClick={() => navigate("/projects/add")}
            className="text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ajouter un projet
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={projects}
          columnFilters={columnFilters}
          emptyText={
            isLoading ? "Chargement des projets..." : "Aucun projet trouvé"
          }
          striped
          hoverEffect
          initialPageSize={10}
          serverPagination
          pageCount={data?.last_page}
          pageIndex={data?.current_page ? data.current_page - 1 : 0}
          onPaginationChange={({ pageIndex, pageSize }) =>
            setPagination({ pageIndex, pageSize })
          }
          onBulkDelete={(ids) => {
            setPendingBulkDeleteIds(ids);
            setBulkDeleteConfirmOpen(true);
          }}
        />
      </div>
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={bulkDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suppression en masse</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-lg">{bulkDeleteMessage}</div>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={() => setBulkDeleteModalOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression en masse</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer les projets sélectionnés ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteConfirmOpen(false)}
              disabled={bulkDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setBulkDeleting(true);
                try {
                  await bulkDeleteProjects(pendingBulkDeleteIds).unwrap();
                  refetch();
                  setBulkDeleteMessage("Projets supprimés avec succès.");
                  setBulkDeleteModalOpen(true);
                } catch (error) {
                  setBulkDeleteMessage(
                    "Erreur lors de la suppression des projets."
                  );
                  setBulkDeleteModalOpen(true);
                } finally {
                  setBulkDeleteConfirmOpen(false);
                  setBulkDeleting(false);
                  setPendingBulkDeleteIds([]);
                }
              }}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du partenaire</DialogTitle>
          </DialogHeader>
          {selectedPartner ? (
            <div className="border rounded-lg p-6 bg-white">
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedPartner.partner_name || selectedPartner.name}
                </div>
                {selectedPartner.partner_type && (
                  <div className="text-sm text-gray-500">
                    {selectedPartner.partner_type}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedPartner.email}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Téléphone:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedPartner.phone}
                  </span>
                </div>
                {selectedPartner.pivot?.partner_role && (
                  <div>
                    <span className="font-medium  text-gray-700">
                      Rôle dans le projet:
                    </span>
                    <span className="ml-2 text-gray-900 capitalize">
                      {selectedPartner.pivot.partner_role}
                    </span>
                  </div>
                )}
                {selectedPartner.pivot?.partner_contribution && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Apport au projet:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedPartner.pivot.partner_contribution} DH
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>Aucun partenaire sélectionné.</div>
          )}
          <DialogFooter>
            <Button onClick={() => setPartnerModalOpen(false)} className="mt-4">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Projects;
