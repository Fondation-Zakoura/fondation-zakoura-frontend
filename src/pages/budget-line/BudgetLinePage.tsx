import AddBudgetLineModal from '@/components/budgetLine/AddBudgetLineModal';
import EditBudgetLineModal from '@/components/budgetLine/EditBudgetLineModal';
import ShowBudgetLineModal from '@/components/budgetLine/ShowBudgetLineModal';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetBudgetLinesQuery } from '@/features/api/budgetLineApi';
import type { BudgetLine } from '@/features/types/budgetLine';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { Eye, Pen, Plus, Trash, Users } from 'lucide-react';
import  { useState } from 'react';

function BudgetLinePage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [budgetLineToEdit, setBudgetLineToEdit] = useState<BudgetLine | null>(null);
    const [showPartnersModal, setShowPartnersModal] = useState(false);
    const [selectedBudgetLine, setSelectedBudgetLine] = useState<BudgetLine | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [budgetLineToView, setBudgetLineToView] = useState<BudgetLine | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    const { data: apiData, isLoading, refetch } = useGetBudgetLinesQuery({ 
        page: currentPage, 
        perPage: pageSize 
    });
    
    // Extract pagination data from the response
    const budgetLines = apiData?.data || [];
  
    const perPage = apiData?.per_page || 10;
    const totalPages = apiData?.last_page || 1;
    const currentPageFromApi = apiData?.current_page || 1;
    
    console.log(apiData);
    
    const openAdd = () => {
        setShowAddModal(true);
    }
    const openShow = (row: BudgetLine) => {
        setBudgetLineToView(row);
        setShowViewModal(true);
    }
    const openEdit = (row:BudgetLine) => {
        setBudgetLineToEdit(row);
        setShowEditModal(true);
    }
    
    const openPartners = (row: BudgetLine) => {
        setSelectedBudgetLine(row);
        setShowPartnersModal(true);
    }
    
    const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize?: number }) => {
        const newPage = pageIndex + 1;
        setCurrentPage(newPage);
        if (pageSize) {
            setPageSize(pageSize);
        }
    };
    
     const columns: Column<BudgetLine & { id?: number }>[] = [
        { key: 'code', header: 'Code', sortable: true },
        { key: 'total_amount', header: 'Montant Total', sortable: true },
        { key: 'consumed_amount', header: 'Montant consommée', sortable: true },
        { key: 'remaining_amount', header: 'Montant Disponible', sortable: true },
        {
          key: 'partners',
          header: 'Partenaires',
          render: (row) => {
            const partners = row.partners || [];
            if (partners.length === 0) {
              return <span className="text-gray-400">Aucun partenaire</span>;
            }
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPartners(row)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Users size={14} />
                  <span>{partners.length} partenaire{partners.length > 1 ? 's' : ''}</span>
                </button>
              </div>
            );
          },
          sortable: false,
        },
        {
          key: 'actions',
          header: 'Actions',
          align: 'right',
          render: (row) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => openShow(row)} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Voir"><Eye size={16} /></button>
              <button onClick={() => openEdit(row)} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Éditer"><Pen size={16} /></button>
              <button
                onClick={() => {
                  // setBudgetLineToDelete(row); // This line was removed as per the edit hint
                  // setConfirmDeleteOpen(true); // This line was removed as per the edit hint
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
    return (
        <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <PageHeaderLayout
                  title="Lignes budgétaires"
                  breadcrumbs={[
                    { label: 'Finance', url: '/projets/finance/ressources' },
                    { label: 'Lignes budgétaires', active: true },
                  ]}
                />
                <Button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-[#19376D] hover:bg-[#19386df9] text-white font-bold px-6 py-2 cursor-pointer rounded-lg shadow">
                  <Plus className="w-4 h-4" />  Ajouter
                </Button>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                      {isLoading ? (
                        <div>Chargement...</div>
                      ) : (
                        <DataTable
                          columns={columns as Column<any>[]}
                          data={budgetLines}
                          hoverEffect
                          emptyText={isLoading ? 'Chargement des données...' : 'Aucune ligne budgétaire trouvée'}
                          headerStyle={'primary'}
                          striped
                          initialPageSize={perPage}
                          enableBulkDelete={true}
                          serverPagination={true}
                          pageCount={totalPages}
                          pageIndex={currentPageFromApi - 1}
                          onPaginationChange={handlePaginationChange}
                        />
                      )}
              </div>
              {showAddModal && (
                <AddBudgetLineModal
                  onClose={() => setShowAddModal(false)}
                  refetch={refetch}
                />
              )}
              {showEditModal && budgetLineToEdit && (
                <EditBudgetLineModal
                  onClose={() => {
                    setShowEditModal(false);
                    setBudgetLineToEdit(null);
                  }}
                  refetch={refetch}
                  budgetLine={budgetLineToEdit}
                />
              )}
              
              {/* Partners Modal */}
              {showPartnersModal && selectedBudgetLine && (
                <Dialog open onOpenChange={() => setShowPartnersModal(false)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Partenaires - Ligne Budgétaire #{selectedBudgetLine.code}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {selectedBudgetLine.partners && selectedBudgetLine.partners.length > 0 ? (
                        <div className="space-y-3">
                          {selectedBudgetLine.partners.map((partner, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {partner.partner_name || 'Nom du partenaire non disponible'}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Montant alloué: <span className="font-medium">{(partner as any).pivot?.allocated_amount?.toLocaleString('fr-FR') || '0'} MAD</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Aucun partenaire associé à cette ligne budgétaire
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Show Budget Line Modal */}
              {showViewModal && budgetLineToView && (
                <ShowBudgetLineModal
                  onClose={() => {
                    setShowViewModal(false);
                    setBudgetLineToView(null);
                  }}
                  budgetLine={budgetLineToView}
                />
              )}
        </div>
    );
}

export default BudgetLinePage;