import React, { useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Banknote,
  Home,
  BookUser,
  BadgeInfo,
  Clock,
  Award,
  BriefcaseBusiness,
  Landmark,
  GraduationCap,
  Users
} from 'lucide-react';
import { formatDate } from '@/components/ui/Helper components';

// --- Shadcn UI Components ---
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetAllStatutCollaborateursQuery, useGetArchivedCollaborateurQuery, useGetCollaborateurQuery, useGetCollaborateursQuery, useGetStatutContratsQuery, useGetTypeContratsQuery } from '@/features/api/CollaborateursApi';

// --- Helper Components ---
const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | null;
  children?: React.ReactNode;
  className?: string
}> = ({ icon: Icon, label, value, children, className }) => {
  if (!value && !children) return null;
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-base text-foreground break-words">{value || children}</div>
      </div>
    </div>
  );
};
const ShowCollaborateur = ({ isOpen, onClose, collaborateurid, isArchived = false }: { 
  isOpen: boolean; 
  onClose: () => void; 
  collaborateurid: number;
  isArchived?: boolean;
}) => {
  if (!isOpen || !collaborateurid) return null;
  const { data: collaborateur, isLoading, isError } = isArchived 
    ? useGetArchivedCollaborateurQuery(collaborateurid)
    : useGetCollaborateurQuery(collaborateurid);
  
  const skip = !collaborateur;
  const { data: collaborateursData } = useGetCollaborateursQuery({filters:{}}, { skip });
  const { data: statusContratData } = useGetStatutContratsQuery(undefined, { skip });
  const { data: allStatusData } = useGetAllStatutCollaborateursQuery(undefined, { skip });
  const { data: typeContratsData } = useGetTypeContratsQuery(undefined, { skip });

  const collaborateurs = collaborateursData?.data || [];

  const superieurHierarchique = useMemo(() => (
    collaborateurs.find((collab) => collab.id === collaborateur?.superieur_hierarchique)
  ), [collaborateurs, collaborateur]);

  const statutContrat = useMemo(() => (
    statusContratData?.data?.find((s: { id: number | undefined; }) => s.id === collaborateur?.statut_contrat_id)
  ), [statusContratData, collaborateur]);

  const statutCollaborateur = useMemo(() => (
    allStatusData?.data?.find((s: { id: number | undefined; }) => s.id === collaborateur?.statut_collaborateur_id)
  ), [allStatusData, collaborateur]);

  const typeContrat = useMemo(() => (
    typeContratsData?.data?.find((c: { id: number | undefined; }) => c.id === collaborateur?.type_contrat_id)
  ), [typeContratsData, collaborateur]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-blue-900">
        Chargement du collaborateur...
      </div>
    );
  }

  if (isError || !collaborateur) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-600">
        Erreur lors du chargement du collaborateur.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-0">
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0" onPointerDownOutside={e => e.preventDefault()}>
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8 bg-slate-50">
              {/* --- HEADER --- */}
              <DialogHeader>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-28 w-28 text-3xl border-4 border-white shadow-lg">
                    <AvatarImage src={typeof collaborateur.photo === 'string' ? collaborateur.photo : undefined} alt={`${collaborateur.nom} ${collaborateur.prenom}`} />
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      {collaborateur.nom?.[0]}{collaborateur.prenom?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <DialogTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
                      {collaborateur.nom} {collaborateur.prenom}
                    </DialogTitle>
                    <p className="text-xl text-muted-foreground mt-1">{collaborateur.civilite}</p>
                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                      <Badge variant="default" className="text-sm">{statutCollaborateur?.type || '-'}</Badge>
                      <Badge variant="secondary" className="text-sm">{typeContrat?.type || '-'}</Badge>
                    </div>
                    <DialogDescription>
                      Voici les détails du collaborateur sélectionné.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-10 space-y-8">
                {/* --- PERSONAL INFO SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <User className="w-6 h-6 text-primary"/>
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={BadgeInfo} label="CIN" value={collaborateur.cin} />
                    <DetailItem icon={Calendar} label="Date de naissance" value={formatDate(collaborateur.date_naissance)} />
                    <DetailItem icon={MapPin} label="Lieu de naissance" value={`${collaborateur.region_naissance}, ${collaborateur.province_naissance}`} />
                    <DetailItem icon={BookUser} label="Situation familiale" value={collaborateur.situation_familiale} />
                    <DetailItem icon={MapPin} className="md:col-span-2" label="Adresse de résidence" value={collaborateur.adresse_residence} />
                    <DetailItem icon={MapPin} label="Région/Province" value={`${collaborateur.region_residence}, ${collaborateur.province_residence}`} />
                    <DetailItem icon={Mail} label="Courriel" value={collaborateur.email} />
                    <DetailItem icon={Phone} label="Téléphone" value={collaborateur.telephone} />
                  </div>
                </section>

                {/* --- PROFESSIONAL INFO SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <BriefcaseBusiness className="w-6 h-6 text-primary"/>
                    Informations Professionnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={Briefcase} label="Poste" value={collaborateur.poste} />
                    <DetailItem icon={Landmark} label="Unité organisationnelle" value={collaborateur.unite_organisationnelle} />
                    <DetailItem icon={Users} label="Supérieur hiérarchique" value={superieurHierarchique ? `${superieurHierarchique.nom} ${superieurHierarchique.prenom}` : '-'} />
                    <DetailItem icon={Award} label="Statut du contrat" value={statutContrat?.statut || '-'} />
                    <DetailItem icon={Clock} label="Période d'essai" value={collaborateur.periode_essai ? `${collaborateur.periode_essai} mois` : '-'} />
                    <DetailItem icon={Clock} label="Préavis" value={collaborateur.periode_preavis ? `${collaborateur.periode_preavis} mois` : '-'} />
                  </div>
                </section>

                {/* --- EMPLOYMENT DATES SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary"/>
                    Dates Clés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={Calendar} label="Date d'entrée" value={formatDate(collaborateur.date_entree)} />
                    <DetailItem icon={Calendar} label="Date de sortie" value={formatDate(collaborateur.date_sortie)} />
                  </div>
                </section>

                {/* --- SALARY INFO SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-primary"/>
                    Rémunération
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={Banknote} label="Salaire brut" value={collaborateur.salaire_brut?.toLocaleString('fr-FR') + ' MAD'} />
                    <DetailItem icon={Banknote} label="Salaire net" value={collaborateur.salaire_net?.toLocaleString('fr-FR') + ' MAD'} />
                    <DetailItem icon={Banknote} label="Primes" value={collaborateur.primes ? `${collaborateur.primes} MAD` : '-'} />
                    <DetailItem icon={Calendar} label="Jours de congé" value={collaborateur.nombre_jours_conge?.toString()} />
                  </div>
                </section>

                {/* --- ASSIGNMENT & EXPERIENCE SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-primary"/>
                    Affectation & Expérience
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={Briefcase} label="Projet d'affectation" value={collaborateur.projet_affectation} />
                    <DetailItem icon={MapPin} label="Lieu d'affectation" value={`${collaborateur.region_affectation}, ${collaborateur.province_affectation}`} />
                    <DetailItem icon={Award} label="Expérience totale" value={collaborateur.experience_totale ? `${collaborateur.experience_totale} années` : '-'} />
                    <DetailItem icon={Award} label="Expérience éducation" value={collaborateur.experience_education ? `${collaborateur.experience_education} années` : '-'} />
                  </div>
                </section>

                {/* --- BANK INFO SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                    <Home className="w-6 h-6 text-primary"/>
                    Informations Bancaires
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <DetailItem icon={Landmark} label="Banque" value={collaborateur.banque} />
                    <DetailItem icon={BadgeInfo} label="RIB" value={collaborateur.rib} />
                  </div>
                </section>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowCollaborateur;