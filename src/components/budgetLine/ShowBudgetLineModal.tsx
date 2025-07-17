import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, DollarSign, Calendar, Hash, Building } from 'lucide-react';
import type { BudgetLine } from '@/features/types/budgetLine';

interface Props {
  onClose: () => void;
  budgetLine: BudgetLine;
}

function ShowBudgetLineModal({ onClose, budgetLine }: Props) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
      case 'consumed':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Consommé</Badge>;
      case 'on_alert':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">En alerte</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inconnu</Badge>;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Hash className="w-5 h-5 text-blue-600" />
            Ligne Budgétaire #{budgetLine.code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-4 h-4" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Code</label>
                  <p className="text-lg font-semibold text-gray-900">#{budgetLine.code}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div>{getStatusBadge(budgetLine.status as any)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Projet</label>
                  <p className="text-lg text-gray-900">{budgetLine.project?.project_name || 'Non spécifié'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Rubrique Budgétaire</label>
                  <p className="text-lg text-gray-900">{budgetLine.category?.code  || 'Non spécifiée'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-4 h-4" />
                Informations Financières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 w-full max-w-xs" title={formatAmount(budgetLine.total_amount)}>
                  <div className="w-full text-center text-lg font-semibold text-green-700 truncate">
                    {formatAmount(budgetLine.total_amount)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Montant Total</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200 w-full max-w-xs" title={formatAmount(budgetLine.consumed_amount)}>
                  <div className="w-full text-center text-lg font-semibold text-orange-700 truncate">
                    {formatAmount(budgetLine.consumed_amount)}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Montant Consommé</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 w-full max-w-xs" title={formatAmount(budgetLine.remaining_amount)}>
                  <div className="w-full text-center text-lg font-semibold text-blue-700 truncate">
                    {formatAmount(budgetLine.remaining_amount)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Montant Disponible</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Taux de consommation</span>
                  <span>{((budgetLine.consumed_amount / budgetLine.total_amount) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(budgetLine.consumed_amount / budgetLine.total_amount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partners Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-4 h-4" />
                Partenaires ({budgetLine.partners?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetLine.partners && budgetLine.partners.length > 0 ? (
                <div className="space-y-3">
                  {budgetLine.partners.map((partner, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {partner.partner_name || 'Nom du partenaire non disponible'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Partenaire #{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatAmount((partner as any).pivot?.allocated_amount || 0)}
                        </div>
                        <div className="text-sm text-gray-500">Montant alloué</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Aucun partenaire associé à cette ligne budgétaire</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-4 h-4" />
                Informations Temporelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Créé le</label>
                  <p className="text-gray-900">
                    {new Date(budgetLine.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Modifié le</label>
                  <p className="text-gray-900">
                    {new Date(budgetLine.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShowBudgetLineModal; 