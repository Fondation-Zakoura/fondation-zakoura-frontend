// ShowCollaborateur.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { useGetCollaborateurQuery } from '@/features/api/CollaborateursApi';

const ShowCollaborateur: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: collaborateur, isLoading, isError } = useGetCollaborateurQuery(Number(id));

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-blue-900">Chargement du collaborateur...</div>;
  }

  if (isError || !collaborateur) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-600">Erreur lors du chargement du collaborateur.</div>;
  }

  const InfoItem = ({ label, value }: { label: string; value: string | number | null }) => (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value || '-'}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Détails du collaborateur"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Collaborateurs' },
            { label: 'Afficher', active: true }
          ]}
        />
        <Button onClick={() => navigate(-1)} variant="outline">Retour</Button>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Informations Générales</h2>
            <InfoItem label="Nom" value={collaborateur.nom} />
            <InfoItem label="Prénom" value={collaborateur.prenom} />
            <InfoItem label="Email" value={collaborateur.email} />
            <InfoItem label="CIN" value={collaborateur.cin} />
            <InfoItem label="Téléphone" value={collaborateur.telephone} />
            <InfoItem label="Date de naissance" value={collaborateur.date_naissance} />
            <InfoItem label="Civilité" value={collaborateur.civilite} />
          </CardContent>
        </Card>

        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Poste et Contrat</h2>
            <InfoItem label="Unité Organisationnelle" value={collaborateur.unite_organisationnelle} />
            <InfoItem label="Poste" value={collaborateur.poste} />
            <InfoItem label="Type de Contrat" value={collaborateur.type_contrat} />
            <InfoItem label="Statut du Contrat" value={collaborateur.statut_contrat} />
            <InfoItem label="Statut Collaborateur" value={collaborateur.statut_collaborateur} />
            <InfoItem label="Date d'entrée" value={collaborateur.date_entree ?? null} />
            <InfoItem label="Période d'essai (mois)" value={collaborateur.periode_essai} />
            <InfoItem label="Préavis (mois)" value={collaborateur.periode_preavis} />
          </CardContent>
        </Card>

        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Rémunération et Primes</h2>
            <InfoItem label="Salaire Brut" value={`${collaborateur.salaire_brut} MAD`} />
            <InfoItem label="Salaire Net" value={`${collaborateur.salaire_net} MAD`} />
            <InfoItem label="Nombre de jours de congé" value={collaborateur.nombre_jours_conge} />
          </CardContent>
        </Card>

        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Résidence et Affectation</h2>
            <InfoItem label="Adresse de résidence" value={collaborateur.adresse_residence} />
            <InfoItem label="Région de résidence" value={collaborateur.region_residence} />
            <InfoItem label="Province de résidence" value={collaborateur.province_residence} />
            <InfoItem label="Projet d'affectation" value={collaborateur.projet_affectation} />
            <InfoItem label="Région d'affectation" value={collaborateur.region_affectation} />
            <InfoItem label="Province d'affectation" value={collaborateur.province_affectation} />
          </CardContent>
        </Card>

        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Situation Familiale et Banque</h2>
            <InfoItem label="Situation Familiale" value={collaborateur.situation_familiale} />
            <InfoItem label="Banque" value={collaborateur.banque} />
            <InfoItem label="RIB" value={collaborateur.rib} />
          </CardContent>
        </Card>

        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Responsable Hiérarchique</h2>
            <InfoItem label="ID Responsable" value={collaborateur.superieur_hierarchique || '-'} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ShowCollaborateur;