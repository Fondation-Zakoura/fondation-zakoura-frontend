import React, { useState, useMemo, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown, Settings, Plus, LayoutGrid, List, Trash, Pen, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useGetProjectsQuery, useBulkDeleteProjectsMutation } from '@/features/api/projectsApi';
import type { Project } from '@/features/types/project'; // Make sure this Project type is accurate
import { useNavigate } from 'react-router-dom';
import EditProjectModal from './EditProjectModal';
import { PageHeaderLayout } from '@/layouts/MainLayout';

const columnHelper = createColumnHelper<Project>();

function Projects() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<any>([]); // Stores [{ id: 'columnId', desc: boolean }]
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // RTK Query: Fetches data based on current pagination, filter, and sorting states
  const { data, isLoading, isError, refetch } = useGetProjectsQuery({
    page: pagination.pageIndex + 1, // API usually expects 1-based page numbers
    per_page: pagination.pageSize,
    filter: globalFilter,
    sort: sorting.length > 0 ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined,
  });

  const [bulkDeleteProjects] = useBulkDeleteProjectsMutation();

  const projects = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const pageCount = data?.meta?.last_page || 1;

  // Client-side filtering on the *currently fetched* projects.
  // If your API's `filter` parameter is robust, this client-side filter
  // will only apply to the data *already returned* by the API for the current page.
  // This is typically fine for simple search on the current page.
  const filteredProjects = useMemo(() => {
    if (!globalFilter) return projects;
    const filterLower = globalFilter.toLowerCase();
    return projects.filter((p: Project) =>
      (p.project_name || '').toLowerCase().includes(filterLower) ||
      (p.project_code || '').toLowerCase().includes(filterLower) ||
      (p.project_type?.name || '').toLowerCase().includes(filterLower) ||
      (p.project_status?.name || '').toLowerCase().includes(filterLower)
    );
  }, [projects, globalFilter]);


  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => filteredProjects[parseInt(key)]?.id) // Ensure we get ID from filteredProjects
      .filter(Boolean);

    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins un projet à supprimer.');
      return;
    }

    if (!window.confirm('Voulez-vous vraiment supprimer les projets sélectionnés ? Cette action est irréversible.')) {
      return;
    }

    setBulkDeleting(true);
    try {
      await bulkDeleteProjects(selectedIds).unwrap();
      setRowSelection({});
      refetch();
      alert('Projets supprimés avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      alert('Échec de la suppression des projets.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleShow = (id: number) => {
    navigate(`/projects/${id}`);
  }
  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }
    // Assuming you have a useDeleteProjectMutation hook or similar API call for single delete
    // e.g., await deleteProject(id).unwrap();
    alert(`Simulating deletion of project ${id}.`);
    refetch(); // Refetch data after deletion
  }
  const handleEdit = (id: number) => {
    const projectToEdit = projects.find((p: Project) => p.id === id);
    if (projectToEdit) {
      setEditProject(projectToEdit);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
            onClick={e => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),
      columnHelper.accessor('project_name', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()} // Correct handler
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Nom du Projet
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => <div className="font-medium text-gray-800 text-sm">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor('project_code', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Code du Projet
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => <div className="font-medium text-gray-800 text-sm">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.project_type?.name || '', {
        id: 'project_type_name', // Correct ID for nested property
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Type du Projet
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => <div className="font-medium text-gray-800 text-sm">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.project_status?.name || '', {
        id: 'project_status_name', // Correct ID for nested property
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Statut
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium`}>
            {info.getValue()}
          </Badge>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.start_date ? new Date(row.start_date).toLocaleDateString() : '', {
        id: 'start_date', // Correct ID
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Date de début
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => <div className="text-sm text-gray-500 text-right">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.end_date ? new Date(row.end_date).toLocaleDateString() : '', {
        id: 'end_date', // Correct ID
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 cursor-pointer select-none px-0 hover:bg-transparent text-[#0B2447] font-bold"
          >
            Date de fin
            {{
              asc: <ArrowUp className="ml-2 h-4 w-4" />,
              desc: <ArrowDown className="ml-2 h-4 w-4" />,
            }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
          </Button>
        ),
        cell: info => <div className="text-sm text-gray-500 text-right">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-blue-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); handleShow(row.original.id); }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); handleDelete(row.original.id); }}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-green-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); handleEdit(row.original.id); }}
            >
              <Pen className="h-4 w-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredProjects,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualSorting: true, // This must be TRUE for server-side sorting
    manualFiltering: false, // This is fine if client-side filter is desired on fetched data
    pageCount: pageCount,
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen text-xl text-gray-600">Chargement des projets...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-xl text-red-600">Erreur lors du chargement des projets. Veuillez réessayer.</div>;

  return (
    <>
      <div className='p-8 min-h-screen'>
        <div className="flex justify-between items-center mb-8">
          <PageHeaderLayout
            title="Liste des projets"
            breadcrumbs={[
              { label: 'Tableaux de bord' },
              { label: 'Projets', active: true }
            ]}
          />
          <Button
            onClick={() => navigate('/projects/add')}
            className="bg-[#576CBC] hover:bg-[#19376D] text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ajouter un projet
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Rechercher par nom, code, type ou statut..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-80 border-[#A5D7E8] focus:ring-[#576CBC] h-10 px-4 py-2 rounded-lg shadow-sm"
          />
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkDeleting || Object.keys(rowSelection).length === 0}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg shadow transition-all flex items-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash className="w-4 h-4" /> {bulkDeleting ? 'Suppression...' : 'Supprimer la sélection'}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl shadow border border-[#A5D7E8] bg-white">
          <Table className="min-w-full divide-y divide-[#A5D7E8]">
            <TableHeader className="bg-[#A5D7E8]">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-[#0B2447] font-bold text-base bg-[#A5D7E8] border-b border-[#A5D7E8]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-[#E8F1FF] transition border-b border-[#A5D7E8] group"
                    onClick={() => handleShow(row.original.id)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="px-4 py-3 text-[#19376D] group-hover:text-[#0B2447]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    Aucun résultat trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-700">
            {Object.keys(rowSelection).length} sur {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Lignes par page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {editProject && (
        <EditProjectModal
          isOpen={!!editProject}
          onClose={() => {
            setEditProject(null);
            refetch();
          }}
          project={editProject}
        />
      )}
    </>
  );
}

export default Projects;