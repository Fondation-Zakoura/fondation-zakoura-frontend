import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PageHeaderLayout
} from '@/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useGetCollaborateurQuery,
  useUpdateCollaborateurMutation,
  useGetAllStatutCollaborateursQuery,
  useGetCollaborateursQuery,
  useGetStatutContratsQuery,
  useGetTypeContratsQuery
} from '@/features/api/CollaborateursApi';
import { DatePickerField } from '@/components/ui/Helper components';
import { Combobox } from '@/components/ui/combobox';

const initialForm = {
  civilite: '',
  nom: '',
  prenom: '',
  nom_arabe: '',
  prenom_arabe: '',
  telephone: '',
  email: '',
  password: '',
  cin: '',
  cnss: '',
  cimr: '',
  n_adhesion_assurance: '',
  banque: '',
  rib: '',
  date_naissance: '',
  region_naissance: '',
  province_naissance: '',
  adresse_residence: '',
  region_residence: '',
  province_residence: '',
  unite_organisationnelle: '',
  poste: '',
  statut_collaborateur: '',
  source: '',
  type_contrat: '',
  statut_contrat: '',
  date_entree: '',
  date_sortie: '',
  salaire_brut: '',
  salaire_net: '',
  periode_essai: '',
  periode_preavis: '',
  nombre_jours_conge: '',
  experience_totale: '',
  experience_education: '',
  primes: '',
  projet_affectation: '',
  region_affectation: '',
  province_affectation: '',
  superieur_hierarchique: '',
  formation: '',
  discipline: '',
  etablissement: '',
  date_obtention: '',
  situation_familiale: '',
  membre_famille: '',
  lien_familial_collaborateur: '',
};

const EditCollaborateur: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: collaborateur, isLoading } = useGetCollaborateurQuery(Number(id));
  const [updateCollaborateur] = useUpdateCollaborateurMutation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  // Options (mock, à remplacer par données API)
  const civiliteOptions = [
     { label: 'Monsieur', value: 'Monsieur' },
     { label: 'Madame', value: 'Madame' },
  ];
  const banqueOptions = useMemo(
    () =>
      [
        'Attijariwafa Bank',
        'Banque Populaire',
        'BMCE Bank (Bank of Africa)',
        'CIH Bank',
        'Crédit du Maroc',
        'Société Générale Maroc',
        'BMCI',
        'Al Barid Bank',
        'Banque Atlantique',
        'Umnia Bank',
        'Bank Al Yousr',
        'Banque Zitouna',
        'CFG Bank',
      ].map(b => ({ label: b, value: b })),
    []
  );
  const regionOptions = useMemo(() => [
     'Tanger-Tétouan-Al Hoceïma',
     'L\'Oriental',
     'Fès-Meknès',
     'Rabat-Salé-Kénitra',
     'Béni Mellal-Khénifra',
     'Casablanca-Settat',
     'Marrakech-Safi',
     'Drâa-Tafilalet',
     'Souss-Massa',
     'Guelmim-Oued Noun',
     'Laâyoune-Sakia El Hamra',
     'Dakhla-Oued Ed-Dahab'
  ].map(r => ({ label: r, value: r })), []);
 
  const provinceOptions = useMemo(() => (
     [
       'Fès',
       'Meknès',
       'Rabat',
       'Salé',
       'Kénitra',
       'Tanger',
       'Tétouan',
       'Oujda',
       'Agadir',
       'Casablanca',
       'El Jadida',
       'Safi',
       'Errachidia',
       'Laâyoune',
       'Dakhla'
     ].map(p => ({ label: p, value: p }))
  ), []);
  
  const sourceOptions = useMemo(() => ['Interne', 'Externe'].map(s => ({ label: s, value: s })), []);
  const { data: statusData } = useGetAllStatutCollaborateursQuery();
  const { data: typeContratsData } = useGetTypeContratsQuery();
  const { data: collaborateursData } = useGetCollaborateursQuery({filters: {}});
  const { data:statusContratData } = useGetStatutContratsQuery();  
  const situationFamilialeOptions = useMemo(() => ['Célibataire', 'Marié', 'Divorcé', 'Veuf'].map(s => ({ label: s, value: s })), []);

  const statutCollaborateurOptions = statusData?.data?.map((status: any) => ({
    label: status.type,
    value: String(status.id),
  })) ?? [];

  const typeContratOptions = typeContratsData?.data?.map((type: any) => ({
    label: type.type,
    value: String(type.id),
  })) ?? [];
  const statutContratOptions = statusContratData?.data?.map((statut: any) => ({
    label: statut.statut,
    value: String(statut.id),
  })) ?? [];

  const superieurHierarchiqueOptions = collaborateursData?.data?.map((collab: any) => ({
    label: `${collab.nom} ${collab.prenom}`,
    value: String(collab.id),
  })) ?? [];

  // Dates contrôlées
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(undefined);
  const [dateEntree, setDateEntree] = useState<Date | undefined>(undefined);
  const [dateSortie, setDateSortie] = useState<Date | undefined>(undefined);
  const [dateObtention, setDateObtention] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (collaborateur) {
      const newForm = {
        civilite: collaborateur.civilite || '',
        nom: collaborateur.nom || '',
        prenom: collaborateur.prenom || '',
        nom_arabe: collaborateur.nomArabe || '',
        prenom_arabe: collaborateur.prenomArabe || '',
        telephone: collaborateur.telephone || '',
        email: collaborateur.email || '',
        password: collaborateur.password || '',
        cin: collaborateur.cin || '',
        cnss: collaborateur.cnss || '',
        cimr: collaborateur.cimr || '',
        n_adhesion_assurance: collaborateur.n_adhesion_assurance || '',
        banque: collaborateur.banque || '',
        rib: collaborateur.rib || '',
        date_naissance: collaborateur.date_naissance || '',
        region_naissance: collaborateur.region_naissance || '',
        province_naissance: collaborateur.province_naissance || '',
        adresse_residence: collaborateur.adresse_residence || '',
        region_residence: collaborateur.region_residence || '',
        province_residence: collaborateur.province_residence || '',
        unite_organisationnelle: collaborateur.unite_organisationnelle || '',
        poste: collaborateur.poste || '',
        statut_collaborateur: collaborateur.statut_collaborateur_id ? String(collaborateur.statut_collaborateur_id) : '',
        source: collaborateur.source || '',
        type_contrat: collaborateur.type_contrat_id ? String(collaborateur.type_contrat_id) : '',
        statut_contrat: collaborateur.statut_contrat_id ? String(collaborateur.statut_contrat_id) : '',
        date_entree: collaborateur.date_entree || '',
        date_sortie: collaborateur.date_sortie || '',
        salaire_brut: collaborateur.salaire_brut ? String(collaborateur.salaire_brut) : '',
        salaire_net: collaborateur.salaire_net ? String(collaborateur.salaire_net) : '',
        periode_essai: collaborateur.periode_essai ? String(collaborateur.periode_essai) : '',
        periode_preavis: collaborateur.periode_preavis ? String(collaborateur.periode_preavis) : '',
        nombre_jours_conge: collaborateur.nombre_jours_conge ? String(collaborateur.nombre_jours_conge) : '',
        experience_totale: collaborateur.experience_totale ? String(collaborateur.experience_totale) : '',
        experience_education: collaborateur.experience_education ? String(collaborateur.experience_education) : '',
        primes: collaborateur.primes ? String(collaborateur.primes) : '',
        projet_affectation: collaborateur.projet_affectation || '',
        region_affectation: collaborateur.region_affectation || '',
        province_affectation: collaborateur.province_affectation || '',
        superieur_hierarchique: collaborateur.superieur_hierarchique ? String(collaborateur.superieur_hierarchique) : '',
        formation: collaborateur.formation || '',
        discipline: collaborateur.discipline || '',
        etablissement: collaborateur.etablissement || '',
        date_obtention: collaborateur.date_obtention || '',
        situation_familiale: collaborateur.situation_familiale || '',
        membre_famille: collaborateur.membre_famille || '',
        lien_familial_collaborateur: collaborateur.lien_familial_collaborateur || '',
      };
      setForm(newForm);
      console.log('Collaborateur chargé:', newForm);
      
      
      // Set dates
      if (collaborateur.date_naissance) setDateNaissance(new Date(collaborateur.date_naissance));
      if (collaborateur.date_entree) setDateEntree(new Date(collaborateur.date_entree));
      if (collaborateur.date_sortie) setDateSortie(new Date(collaborateur.date_sortie));
      if (collaborateur.date_obtention) setDateObtention(new Date(collaborateur.date_obtention));
    }
  }, [collaborateur]);

  const handleChange = (name: string, value: string | File | null) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        id: Number(id),
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        nomArabe: form.nom_arabe || '',
        prenomArabe: form.prenom_arabe || '',
        email: form.email.trim(),
        password: form.password.trim(),
        cin: form.cin.trim(),
        cnss: form.cnss || '',
        cimr: form.cimr || '',
        n_adhesion_assurance: form.n_adhesion_assurance || '',
        civilite: ['mr', 'mme', 'Monsieur', 'Madame'].includes(form.civilite) ? form.civilite : 'mr',
        telephone: form.telephone,
        banque: form.banque,
        rib: form.rib,
        date_naissance: form.date_naissance,
        region_naissance: form.region_naissance,
        province_naissance: form.province_naissance,
        adresse_residence: form.adresse_residence,
        region_residence: form.region_residence,
        province_residence: form.province_residence,
        unite_organisationnelle: form.unite_organisationnelle,
        poste: form.poste,
        source: form.source,
        date_entree: form.date_entree,
        date_sortie: form.date_sortie || '',
        salaire_brut: Number(form.salaire_brut),
        salaire_net: Number(form.salaire_net),
        periode_essai: Number(form.periode_essai),
        periode_preavis: Number(form.periode_preavis),
        experience_totale: form.experience_totale ? Number(form.experience_totale) : null,
        experience_education: form.experience_education ? Number(form.experience_education) : null,
        primes: form.primes ? Number(form.primes) : null,
        nombre_jours_conge: Number(form.nombre_jours_conge),
        projet_affectation: form.projet_affectation,
        region_affectation: form.region_affectation,
        province_affectation: form.province_affectation,
        formation: form.formation || '',
        discipline: form.discipline || '',
        etablissement: form.etablissement || '',
        date_obtention: form.date_obtention || '',
        membre_famille: form.membre_famille || '',
        lien_familial_collaborateur: form.lien_familial_collaborateur || '',
        superieur_hierarchique: form.superieur_hierarchique
          ? Number(form.superieur_hierarchique)
          : null,
        situation_familiale: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'].includes(form.situation_familiale)
          ? form.situation_familiale
          : 'Célibataire',
        statut_collaborateur_id: Number(form.statut_collaborateur),
        type_contrat_id: Number(form.type_contrat),
        statut_contrat_id: Number(form.statut_contrat),
        photo: null as File | null,
      };
      
      await updateCollaborateur({ code: String(id), body: payload }).unwrap();
      navigate('/rh/collaborateurs');
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour.');
      console.error(err);
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  

  return (
  <div className="p-8 font-nunito">
    <div className="flex justify-between items-center mb-8">
      <PageHeaderLayout
        title="Modifier un Collaborateur"
        breadcrumbs={[
          { label: "Tableaux de bord" },
          { label: "Collaborateurs" },
          { label: "Modifier", active: true },
        ]}
      />
    </div>
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-8">
        {/* Informations de base */}
        <div className="bg-white rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 shadow p-6 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Civilité *
            </label>
            <Combobox
              options={civiliteOptions}
              value={form.civilite}
              onChange={(val) => handleChange("civilite", val)}
              placeholder="Sélectionner"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Nom *
            </label>
            <Input
              value={form.nom}
              onChange={(e) => handleChange("nom", e.target.value)}
              placeholder="Entrez le nom"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Prénom *
            </label>
            <Input
              value={form.prenom}
              onChange={(e) => handleChange("prenom", e.target.value)}
              placeholder="Entrez le prénom"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Nom (arabe)
            </label>
            <Input
              dir="rtl"
              value={form.nom_arabe}
              onChange={(e) => handleChange("nom_arabe", e.target.value)}
              placeholder="أدخل النسب بالعربية"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Prénom (arabe)
            </label>
            <Input
              dir="rtl"
              value={form.prenom_arabe}
              onChange={(e) => handleChange("prenom_arabe", e.target.value)}
              placeholder="أدخل الاسم بالعربية"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Coordonnées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Téléphone *
              </label>
              <Input
                type="tel"
                value={form.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
                placeholder="06 12 34 56 78"
                required
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                E-mail *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                placeholder="exemple@domaine.com"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Mot de passe *
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                placeholder="Créez un mot de passe"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Informations administratives */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Informations administratives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                C.I.N *
              </label>
              <Input
                value={form.cin}
                onChange={(e) => handleChange("cin", e.target.value)}
                placeholder="Entrez le numéro CIN"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                C.N.S.S
              </label>
              <Input
                value={form.cnss}
                onChange={(e) => handleChange("cnss", e.target.value)}
                placeholder="Entrez le numéro CNSS"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                C.I.M.R
              </label>
              <Input
                value={form.cimr}
                onChange={(e) => handleChange("cimr", e.target.value)}
                placeholder="Entrez le numéro CIMR"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                N adhésion assurance
              </label>
              <Input
                value={form.n_adhesion_assurance}
                onChange={(e) => handleChange("n_adhesion_assurance", e.target.value)}
                placeholder="Entrez le numéro d'adhésion"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Banque *
              </label>
              <Combobox
                options={banqueOptions}
                value={form.banque}
                onChange={(val) => handleChange("banque", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                R.I.B *
              </label>
              <Input
                value={form.rib}
                onChange={(e) => handleChange("rib", e.target.value)}
                placeholder="Entrer le rib"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Date de naissance *
              </label>
              <DatePickerField
                selected={dateNaissance}
                onSelect={(date) => {
                  setDateNaissance(date);
                  handleChange(
                    "date_naissance",
                    date ? format(date, "yyyy-MM-dd") : ""
                  );
                }} 
                label={''}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Région de naissance *
              </label>
              <Combobox
                options={regionOptions}
                value={form.region_naissance}
                onChange={(val) => handleChange("region_naissance", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Province de naissance *
              </label>
              <Combobox
                options={provinceOptions}
                value={form.province_naissance}
                onChange={(val) => handleChange("province_naissance", val)}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Adresse de résidence
              </label>
              <Input
                value={form.adresse_residence}
                onChange={(e) => handleChange("adresse_residence", e.target.value)}
                placeholder="Entrez l'adresse complète"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Région de résidence *
              </label>
              <Combobox
                options={regionOptions}
                value={form.region_residence}
                onChange={(val) => handleChange("region_residence", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Province de résidence *
              </label>
              <Combobox
                options={provinceOptions}
                value={form.province_residence}
                onChange={(val) => handleChange("province_residence", val)}
                placeholder="Sélectionner"
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Informations professionnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Unité organisationnelle *
              </label>
              <Input
                value={form.unite_organisationnelle}
                onChange={(e) => handleChange("unite_organisationnelle", e.target.value)}
                placeholder="Entrez l'unité organisationnelle"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Poste *
              </label>
              <Input
                value={form.poste}
                onChange={(e) => handleChange("poste", e.target.value)}
                placeholder="Entrez le poste occupé"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Statut collaborateur *
              </label>
              <Combobox
                options={statutCollaborateurOptions}
                value={form.statut_collaborateur}
                onChange={(val) => handleChange("statut_collaborateur", val)}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Source *
              </label>
              <Combobox
                options={sourceOptions}
                value={form.source}
                onChange={(val) => handleChange("source", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Type de contrat *
              </label>
              <Combobox
                options={typeContratOptions}
                value={form.type_contrat}
                onChange={(val) => handleChange("type_contrat", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Statut du contrat *
              </label>
              <Combobox
                options={statutContratOptions}
                value={form.statut_contrat}
                onChange={(val) => handleChange("statut_contrat", val)}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Date d'entrée *
              </label>
              <DatePickerField
                selected={dateEntree}
                onSelect={(date) => {
                  setDateEntree(date);
                  handleChange(
                    "date_entree",
                    date ? format(date, "yyyy-MM-dd") : ""
                  );
                }} 
                label={''}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Date de sortie *
              </label>
              <DatePickerField
                selected={dateSortie}
                onSelect={(date) => {
                  setDateSortie(date);
                  handleChange(
                    "date_sortie",
                    date ? format(date, "yyyy-MM-dd") : ""
                  );
                }} 
                label={''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Salaire BRUT *
              </label>
              <Input
                type="number"
                value={form.salaire_brut}
                onChange={(e) => handleChange("salaire_brut", e.target.value)}
                placeholder="Entrez le salaire brut"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Salaire NET *
              </label>
              <Input
                type="number"
                value={form.salaire_net}
                onChange={(e) => handleChange("salaire_net", e.target.value)}
                placeholder="Entrez le salaire net"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Période d'essai *
              </label>
              <Input
                type="number"
                value={form.periode_essai}
                onChange={(e) => handleChange("periode_essai", e.target.value)}
                placeholder="Durée"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Période de préavis *
              </label>
              <Input
                type="number"
                value={form.periode_preavis}
                onChange={(e) => handleChange("periode_preavis", e.target.value)}
                placeholder="Durée"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Nombre jours de congé *
              </label>
              <Input
                type="number"
                value={form.nombre_jours_conge}
                onChange={(e) => handleChange("nombre_jours_conge", e.target.value)}
                placeholder="Nombre de jours"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Expérience totale
              </label>
              <Input
                type="number"
                value={form.experience_totale}
                onChange={(e) => handleChange("experience_totale", e.target.value)}
                placeholder="Années d'expérience"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Expérience en éducation
              </label>
              <Input
                type="number"
                value={form.experience_education}
                onChange={(e) => handleChange("experience_education", e.target.value)}
                placeholder="Années dans l'éducation"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Primes (panier, transport, etc.)
              </label>
              <Input
                type="number"
                value={form.primes}
                onChange={(e) => handleChange("primes", e.target.value)}
                placeholder="Montant des primes"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Affectation et formation */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Affectation et formation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Projet d'affectation *
              </label>
              <Input
                value={form.projet_affectation}
                onChange={(e) => handleChange("projet_affectation", e.target.value)}
                placeholder="Entrez le projet d'affectation"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Région d'affectation *
              </label>
              <Combobox
                options={regionOptions}
                value={form.region_affectation}
                onChange={(val) => handleChange("region_affectation", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Province d'affectation *
              </label>
              <Combobox
                options={provinceOptions}
                value={form.province_affectation}
                onChange={(val) => handleChange("province_affectation", val)}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Superieur Hiérarchique *
              </label>
              <Combobox
                options={superieurHierarchiqueOptions}
                value={form.superieur_hierarchique}
                onChange={(val) => handleChange("superieur_hierarchique", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Formation (diplôme)
              </label>
              <Input
                value={form.formation}
                onChange={(e) => handleChange("formation", e.target.value)}
                placeholder="Diplôme obtenu"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Discipline
              </label>
              <Input
                value={form.discipline}
                onChange={(e) => handleChange("discipline", e.target.value)}
                placeholder="Domaine d'étude"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Établissement
              </label>
              <Input
                value={form.etablissement}
                onChange={(e) => handleChange("etablissement", e.target.value)}
                placeholder="Nom de l'établissement"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Date d'obtention
              </label>
              <DatePickerField
                selected={dateObtention}
                onSelect={(date) => {
                  setDateObtention(date);
                  handleChange(
                    "date_obtention",
                    date ? format(date, "yyyy-MM-dd") : ""
                  );
                }} 
                label={''}
              />
            </div>
          </div>
        </div>

        {/* Situation familiale */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Situation familiale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Situation familiale *
              </label>
              <Combobox
                options={situationFamilialeOptions}
                value={form.situation_familiale}
                onChange={(val) => handleChange("situation_familiale", val)}
                placeholder="Sélectionner"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Membre famille
              </label>
              <Input
                value={form.membre_famille}
                onChange={(e) => handleChange("membre_famille", e.target.value)}
                placeholder="Nom du membre"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-left">
                Lien familial collaborateur
              </label>
              <Input
                value={form.lien_familial_collaborateur}
                onChange={(e) => handleChange("lien_familial_collaborateur", e.target.value)}
                placeholder="Entrez le lien familial"
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Photo</h3>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-left">
              Photo
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleChange("photo", e.target.files?.[0] ?? null)
              }
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
            onClick={() => navigate("/rh/collaborateurs")}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 transition text-white px-8 py-2 rounded-lg font-semibold shadow"
          >
            Enregistrer
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
        )}
      </Card>
    </form>
  </div>
);
};

export default EditCollaborateur;
