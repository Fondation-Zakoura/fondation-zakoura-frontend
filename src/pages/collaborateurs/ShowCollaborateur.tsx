import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeaderLayout } from '@/layouts/MainLayout';

import {
  useGetAllStatutCollaborateursQuery,
  useGetCollaborateurQuery,
  useGetCollaborateursQuery,
  useGetStatutContratsQuery,
  useGetTypeContratsQuery
} from '@/features/api/CollaborateursApi';
import { formatDate, InfoCard, InfoItem } from '@/components/ui/Helper components';

const ShowCollaborateur: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: collaborateur, isLoading, isError } = useGetCollaborateurQuery(Number(id));
  const skip = !collaborateur;

  const { data: collaborateursData } = useGetCollaborateursQuery({}, { skip });
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Détails du collaborateur"
          breadcrumbs={[
            { label: 'Tableau de bord' },
            { label: 'Collaborateurs' },
            { label: 'Afficher', active: true }
          ]}
        />
        <Button onClick={() => navigate(-1)} variant="outline">
          Retour
        </Button>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Photo + Nom */}
        <Card className="shadow bg-white rounded-xl flex flex-col items-center p-6">
          {collaborateur.photo ? (
            <img
              loading="lazy"
              src={typeof collaborateur.photo === 'string' ? collaborateur.photo : URL.createObjectURL(collaborateur.photo)}
              alt={`${collaborateur.nom} ${collaborateur.prenom}`}
              className="w-32 h-32 rounded-full object-cover mb-4 border border-gray-300"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4">
              Photo
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{`${collaborateur.nom} ${collaborateur.prenom}`}</h2>
          <p className="text-gray-600">{collaborateur.civilite}</p>
        </Card>

        {/* Informations personnelles */}
        <InfoCard title="Informations personnelles">
          <InfoItem label="Email" value={collaborateur.email} />
          <InfoItem label="CIN" value={collaborateur.cin} />
          <InfoItem label="Téléphone" value={collaborateur.telephone} />
          <InfoItem label="Date de naissance" value={formatDate(collaborateur.date_naissance)} />
          <InfoItem label="Lieu de naissance" value={`${collaborateur.region_naissance}, ${collaborateur.province_naissance}`} />
          <InfoItem label="Adresse résidence" value={collaborateur.adresse_residence} />
          <InfoItem label="Région résidence" value={collaborateur.region_residence} />
          <InfoItem label="Province résidence" value={collaborateur.province_residence} />
          <InfoItem label="Situation familiale" value={collaborateur.situation_familiale} />
          <InfoItem label="Banque" value={collaborateur.banque} />
          <InfoItem label="RIB" value={collaborateur.rib} />
        </InfoCard>

        {/* Poste et Contrat */}
        <InfoCard title="Poste et Contrat">
          <InfoItem label="Unité organisationnelle" value={collaborateur.unite_organisationnelle} />
          <InfoItem label="Poste" value={collaborateur.poste} />
          <InfoItem label="Type de contrat" value={typeContrat?.type || '-'} />
          <InfoItem label="Statut du contrat" value={statutContrat?.statut || '-'} />
          <InfoItem label="Statut collaborateur" value={statutCollaborateur?.type || '-'} />
          <InfoItem label="Date d'entrée" value={formatDate(collaborateur.date_entree)} />
          <InfoItem label="Date de sortie" value={formatDate(collaborateur.date_sortie)} />
          <InfoItem label="Période d'essai (mois)" value={collaborateur.periode_essai} />
          <InfoItem label="Préavis (mois)" value={collaborateur.periode_preavis} />
          <InfoItem label="Projet d'affectation" value={collaborateur.projet_affectation} />
          <InfoItem label="Région d'affectation" value={collaborateur.region_affectation} />
          <InfoItem label="Province d'affectation" value={collaborateur.province_affectation} />
        </InfoCard>

        {/* Rémunération */}
        <InfoCard title="Rémunération et primes">
          <InfoItem label="Salaire brut" value={`${collaborateur.salaire_brut?.toLocaleString('fr-FR')} MAD`} />
          <InfoItem label="Salaire net" value={`${collaborateur.salaire_net?.toLocaleString('fr-FR')} MAD`} />
          <InfoItem label="Primes" value={collaborateur.primes ?? '-'} />
          <InfoItem label="Nombre jours congé" value={collaborateur.nombre_jours_conge} />
        </InfoCard>

        {/* Formation & expérience */}
        <InfoCard title="Formation & Expérience">
          <InfoItem label="Formation" value={collaborateur.formation} />
          <InfoItem label="Discipline" value={collaborateur.discipline} />
          <InfoItem label="Etablissement" value={collaborateur.etablissement} />
          <InfoItem label="Date obtention" value={formatDate(collaborateur.date_obtention)} />
          <InfoItem label="Expérience totale (années)" value={collaborateur.experience_totale} />
          <InfoItem label="Expérience éducation (années)" value={collaborateur.experience_education} />
        </InfoCard>

        {/* Responsable hiérarchique */}
        <InfoCard title="Responsable hiérarchique">
          <InfoItem
            label="Nom du Responsable"
            value={superieurHierarchique ? `${superieurHierarchique.nom} ${superieurHierarchique.prenom}` : '-'}
          />
        </InfoCard>
      </main>
    </div>
  );
};

export default ShowCollaborateur;
