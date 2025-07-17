import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeaderLayout } from '@/layouts/MainLayout';

import {
  useGetAllStatutCollaborateursQuery,
  useGetCollaborateurQuery,
  useGetCollaborateursQuery,
  useGetStatutContratsQuery,
  useGetTypeContratsQuery
} from '@/features/api/CollaborateursApi';
import { formatDate } from '@/components/ui/Helper components';
import { Badge } from '@/components/ui/badge';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center overflow-hidden">
              {collaborateur.photo ? (
                <img 
                  src={typeof collaborateur.photo === 'string' ? collaborateur.photo : URL.createObjectURL(collaborateur.photo)}
                  alt={`${collaborateur.nom} ${collaborateur.prenom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Photo</span>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {collaborateur.nom} {collaborateur.prenom}
            </h2>
            <p className="text-gray-600 mb-4">{collaborateur.civilite}</p>
            
            <div className="w-full space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{collaborateur.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm font-medium">{collaborateur.telephone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CIN</p>
                <p className="text-sm font-medium">{collaborateur.cin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informations personnelles</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Date de naissance</p>
                <p className="text-sm font-medium">{formatDate(collaborateur.date_naissance)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lieu de naissance</p>
                <p className="text-sm font-medium">
                  {collaborateur.region_naissance}, {collaborateur.province_naissance}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p className="text-sm font-medium">{collaborateur.adresse_residence}</p>
                <p className="text-sm text-gray-600">
                  {collaborateur.region_residence}, {collaborateur.province_residence}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Situation familiale</p>
                <p className="text-sm font-medium">{collaborateur.situation_familiale}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Banque</p>
                <p className="text-sm font-medium">{collaborateur.banque}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">RIB</p>
                <p className="text-sm font-medium">{collaborateur.rib}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informations professionnelles</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Poste</p>
                <p className="text-sm font-medium">{collaborateur.poste}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unité organisationnelle</p>
                <p className="text-sm font-medium">{collaborateur.unite_organisationnelle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <Badge variant="outline">{statutCollaborateur.type}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type de contrat</p>
                <p className="text-sm font-medium">{typeContrat.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Statut du contrat</p>
                <p className="text-sm font-medium">{statutContrat.statut}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Dates */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Dates clés</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Date d'entrée</p>
                <p className="text-sm font-medium">{formatDate(collaborateur.date_entree)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date de sortie</p>
                <p className="text-sm font-medium">{formatDate(collaborateur.date_sortie)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Période d'essai</p>
                <p className="text-sm font-medium">{collaborateur.periode_essai} mois</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Préavis</p>
                <p className="text-sm font-medium">{collaborateur.periode_preavis} mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Rémunération</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Salaire brut</p>
                <p className="text-sm font-medium">
                  {collaborateur.salaire_brut?.toLocaleString('fr-FR')} MAD
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salaire net</p>
                <p className="text-sm font-medium">
                  {collaborateur.salaire_net?.toLocaleString('fr-FR')} MAD
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Primes</p>
                <p className="text-sm font-medium">
                  {collaborateur.primes ? `${collaborateur.primes} MAD` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Jours de congé</p>
                <p className="text-sm font-medium">{collaborateur.nombre_jours_conge}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Experience */}
        <Card className="shadow bg-white rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Affectation & Expérience</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Projet d'affectation</p>
                <p className="text-sm font-medium">{collaborateur.projet_affectation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lieu d'affectation</p>
                <p className="text-sm font-medium">
                  {collaborateur.region_affectation}, {collaborateur.province_affectation}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expérience totale</p>
                <p className="text-sm font-medium">
                  {collaborateur.experience_totale || '-'} années
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expérience éducation</p>
                <p className="text-sm font-medium">
                  {collaborateur.experience_education || '-'} années
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Superieur hiérarchique</p>
                <p className="text-sm font-medium">{superieurHierarchique?.nom} {superieurHierarchique?.prenom || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

};

export default ShowCollaborateur;
