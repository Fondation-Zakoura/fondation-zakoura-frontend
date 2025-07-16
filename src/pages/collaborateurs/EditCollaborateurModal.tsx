import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PageHeaderLayout
} from '@/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  useGetCollaborateurQuery,
  useUpdateCollaborateurMutation,
  useGetAllStatutCollaborateursQuery,
  useGetCollaborateursQuery,
  useGetStatutContratsQuery,
  useGetTypeContratsQuery
} from '@/features/api/CollaborateursApi';
import { DatePickerField, InputField, SelectField } from '@/components/ui/Helper components';

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
  const banqueOptions = useMemo(() => [
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
     'CFG Bank'
  ], []);
  const regionOptions = useMemo(() => [
     'Tanger-Tétouan-Al Hoceïma',
     'L’Oriental',
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
  ], []);
 
  const provinceOptions = useMemo(() => [
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
  ], []);
  const sourceOptions = useMemo(()=>['Interne', 'Externe'],[]) ;
  const { data: statusData } = useGetAllStatutCollaborateursQuery();
  const { data: typeContratsData } = useGetTypeContratsQuery();
  const { data: collaborateursData } = useGetCollaborateursQuery({});
  const { data:statusContratData } = useGetStatutContratsQuery();  
  const situationFamilialeOptions = useMemo(()=>['Célibataire', 'Marié', 'Divorcé', 'Veuf'],[]);

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
            { label: 'Tableaux de bord' },
            { label: 'Collaborateurs' },
            { label: 'Modifier', active: true }
          ]}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8 space-y-6">
          {/* Civilité, Nom, Prénom, Nom arabe, Prénom arabe */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Civilité</label>
              <Select value={form.civilite} onValueChange={val => handleChange('civilite', val)} required>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                    {civiliteOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nom</label>
              <Input value={form.nom} onChange={e => handleChange('nom', e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prénom</label>
              <Input value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nom (arabe)</label>
              <Input dir='rtl' value={form.nom_arabe} onChange={e => handleChange('nom_arabe', e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prénom (arabe)</label>
              <Input dir='rtl' value={form.prenom_arabe} onChange={e => handleChange('prenom_arabe', e.target.value)} />
            </div>
          </div>

          {/* Téléphone, E-mail, Mot de passe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Téléphone</label>
              <Input type="tel" value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">E-mail</label>
              <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Mot de passe</label>
              <Input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} required />
            </div>
          </div>

          {/* CIN, CNSS, CIMR, N adhésion assurance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField label="C.I.N" value={form.cin} onChange={val => handleChange('cin', val)} />
            <InputField label="C.N.S.S" value={form.cnss} onChange={val => handleChange('cnss', val)} />
            <InputField label="C.I.M.R" value={form.cimr} onChange={val => handleChange('cimr', val)} />
            <InputField label="N adhésion assurance" value={form.n_adhesion_assurance} onChange={val => handleChange('n_adhesion_assurance', val)} />
          </div>

          {/* Banque, R.I.B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Banque</label>
              <Select value={form.banque} onValueChange={val => handleChange('banque', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {banqueOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <InputField label="R.I.B" value={form.rib} onChange={val => handleChange('rib', val)} />
          </div>

          {/* Date de naissance, Région naissance, Province naissance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerField
              label="Date de naissance"
              selected={dateNaissance}
              onSelect={date => {
                setDateNaissance(date);
                handleChange('date_naissance', date ? format(date, 'yyyy-MM-dd') : '');
              }}
            />
            <SelectField
              label="Région de naissance"
              value={form.region_naissance}
              options={regionOptions}
              onChange={val => handleChange('region_naissance', val)}
            />
            <SelectField
              label="Province de naissance"
              value={form.province_naissance}
              options={provinceOptions}
              onChange={val => handleChange('province_naissance', val)}
            />
          </div>

          {/* Adresse résidence, Région résidence, Province résidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Adresse de résidence" value={form.adresse_residence} onChange={val => handleChange('adresse_residence', val)} />
            <SelectField label="Région de résidence" value={form.region_residence} options={regionOptions} onChange={val => handleChange('region_residence', val)} />
            <SelectField label="Province de résidence" value={form.province_residence} options={provinceOptions} onChange={val => handleChange('province_residence', val)} />
          </div>

          {/* Unité organisationnelle, Poste, Statut collaborateur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Unité organisationnelle" value={form.unite_organisationnelle} onChange={val => handleChange('unite_organisationnelle', val)} />
            <InputField label="Poste" value={form.poste} onChange={val => handleChange('poste', val)} />
            <SelectField 
              label="Statut collaborateur" 
              value={form.statut_collaborateur} 
              options={statutCollaborateurOptions} 
              onChange={val => handleChange('statut_collaborateur', val)} 
            />
          </div>

          {/* Source, Type de contrat, Statut du contrat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Source" value={form.source} options={sourceOptions} onChange={val => handleChange('source', val)} />
            <SelectField label="Type de contrat" value={form.type_contrat} options={typeContratOptions} onChange={val => handleChange('type_contrat', val)} />
            <SelectField label="Statut du contrat" value={form.statut_contrat} options={statutContratOptions} onChange={val => handleChange('statut_contrat', val)} />
          </div>

          {/* Date d'entrée, Date de sortie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField label="Date d'entrée" selected={dateEntree} onSelect={date => {
              setDateEntree(date);
              handleChange('date_entree', date ? format(date, 'yyyy-MM-dd') : '');
            }} />
            <DatePickerField label="Date de sortie" selected={dateSortie} onSelect={date => {
              setDateSortie(date);
              handleChange('date_sortie', date ? format(date, 'yyyy-MM-dd') : '');
            }} />
          </div>

          {/* Salaire BRUT, Salaire NET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Salaire BRUT" type="number" value={form.salaire_brut} onChange={val => handleChange('salaire_brut', val)} />
            <InputField label="Salaire NET" type="number" value={form.salaire_net} onChange={val => handleChange('salaire_net', val)} />
          </div>

          {/* Période d'essai, Période de préavis, Nombre jours de congé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Période d'essai" type="number" value={form.periode_essai} onChange={val => handleChange('periode_essai', val)} />
            <InputField label="Période de préavis" type="number" value={form.periode_preavis} onChange={val => handleChange('periode_preavis', val)} />
            <InputField label="Nombre jours de congé" type="number" value={form.nombre_jours_conge} onChange={val => handleChange('nombre_jours_conge', val)} />
          </div>

          {/* Expérience totale, Expérience en éducation, Primes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Expérience totale" type="number" value={form.experience_totale} onChange={val => handleChange('experience_totale', val)} />
            <InputField label="Expérience en éducation" type="number" value={form.experience_education} onChange={val => handleChange('experience_education', val)} />
            <InputField label="Primes (panier, transport, etc.)" type="number" value={form.primes} onChange={val => handleChange('primes', val)} />
          </div>

          {/* Projet d'affectation, Région d'affectation, Province d'affectation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Projet d'affectation" value={form.projet_affectation} onChange={val => handleChange('projet_affectation', val)} />
            <SelectField label="Région d'affectation" value={form.region_affectation} options={regionOptions} onChange={val => handleChange('region_affectation', val)} />
            <SelectField label="Province d'affectation" value={form.province_affectation} options={provinceOptions} onChange={val => handleChange('province_affectation', val)} />
          </div>

          {/* Supérieur hiérarchique (link), Formation (diplôme), Discipline, Établissement */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField label="Superieur Hierarchique" value={form.superieur_hierarchique} options={superieurHierarchiqueOptions} onChange={val => handleChange('superieur_hierarchique', val)} />
            <InputField label="Formation (diplôme)" value={form.formation} onChange={val => handleChange('formation', val)} />
            <InputField label="Discipline" value={form.discipline} onChange={val => handleChange('discipline', val)} />
            <InputField label="Établissement" value={form.etablissement} onChange={val => handleChange('etablissement', val)} />
          </div>

          {/* Date d'obtention */}
          <DatePickerField label="Date d'obtention" selected={dateObtention} onSelect={date => {
            setDateObtention(date);
            handleChange('date_obtention', date ? format(date, 'yyyy-MM-dd') : '');
          }} />

          {/* Situation familiale, Membre famille, Lien familial collaborateur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Situation familiale" value={form.situation_familiale} options={situationFamilialeOptions} onChange={val => handleChange('situation_familiale', val)} />
            <InputField label="Membre famille" value={form.membre_famille} onChange={val => handleChange('membre_famille', val)} />
            <InputField label="Lien familial collaborateur" value={form.lien_familial_collaborateur} onChange={val => handleChange('lien_familial_collaborateur', val)} />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Photo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => handleChange('photo', e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
              onClick={() => navigate('/rh/collaborateurs')}
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

          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
        </Card>
      </form>
    </div>
  );
};

export default EditCollaborateur;
