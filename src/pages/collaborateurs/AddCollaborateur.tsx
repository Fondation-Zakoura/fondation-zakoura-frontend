import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  PageHeaderLayout 
} from '@/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  useAddCollaborateurMutation
} from '@/features/api/CollaborateursApi';

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

const AddCollaborateurs: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [addCollaborateur] = useAddCollaborateurMutation();

  // Options (mock, à remplacer par données API)
  const civiliteOptions = [
    { label: 'Monsieur', value: 'Monsieur' },
    { label: 'Madame', value: 'Madame' },
    { label: 'mr', value: 'mr' },
    { label: 'mme', value: 'mme' }
  ];
  const banqueOptions = ['Banque A', 'Banque B', 'Banque C'];
  const regionOptions = ['Région 1', 'Région 2', 'Région 3'];
  const provinceOptions = ['Province 1', 'Province 2', 'Province 3'];
  const statutCollaborateurOptions = [
    { label: 'Actif', value: '1' },
    { label: 'Inactif', value: '2' }
  ];
  const sourceOptions = ['Interne', 'Externe'];
  const typeContratOptions = [
    { label: 'CDI', value: '1' },
    { label: 'CDD', value: '2' },
    { label: 'Stage', value: '3' },
  ];
  const statutContratOptions = [
    { label: 'En cours', value: '1' },
    { label: 'Terminé', value: '2' },
    { label: 'Suspendu', value: '3' }
  ];
  const situationFamilialeOptions = ['Célibataire', 'Marié', 'Divorcé', 'Veuf'];

  // Dates contrôlées
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(form.date_naissance ? new Date(form.date_naissance) : undefined);
  const [dateEntree, setDateEntree] = useState<Date | undefined>(form.date_entree ? new Date(form.date_entree) : undefined);
  const [dateSortie, setDateSortie] = useState<Date | undefined>(form.date_sortie ? new Date(form.date_sortie) : undefined);
  const [dateObtention, setDateObtention] = useState<Date | undefined>(form.date_obtention ? new Date(form.date_obtention) : undefined);

  // Gestion des changements
  const handleChange = (name: string, value: string | File | null) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

      try {
        const payload = {
      nom: String(form.nom).trim(),
      prenom: String(form.prenom).trim(),
      email: String(form.email).trim(),
      password: String(form.password).trim(),
      cin: String(form.cin).trim(),

      // Civilité : doit être "mr", "mme", "Monsieur" ou "Madame"
      civilite: ['mr', 'mme', 'Monsieur', 'Madame'].includes(form.civilite) 
        ? form.civilite 
        : 'mr', // fallback (ou afficher une erreur au front)

      telephone: String(form.telephone).trim(),
      banque: String(form.banque).trim(),
      rib: String(form.rib).trim(),

      date_naissance: form.date_naissance, // assume format YYYY-MM-DD
      region_naissance: String(form.region_naissance).trim(),
      province_naissance: String(form.province_naissance).trim(),

      adresse_residence: String(form.adresse_residence).trim(),
      region_residence: String(form.region_residence).trim(),
      province_residence: String(form.province_residence).trim(),

      unite_organisationnelle: String(form.unite_organisationnelle).trim(),
      poste: String(form.poste).trim(),
      source: String(form.source).trim(),

      date_entree: form.date_entree, // assume format YYYY-MM-DD

      salaire_brut: Number(form.salaire_brut),
      salaire_net: Number(form.salaire_net),
      periode_essai: Number(form.periode_essai),
      periode_preavis: Number(form.periode_preavis),
      nombre_jours_conge: Number(form.nombre_jours_conge),

      projet_affectation: String(form.projet_affectation).trim(),
      region_affectation: String(form.region_affectation).trim(),
      province_affectation: String(form.province_affectation).trim(),

      superieur_hierarchique: form.superieur_hierarchique === '' 
        ? null 
        : Number(form.superieur_hierarchique),

      // Situation familiale : "Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"
      situation_familiale: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'].includes(form.situation_familiale)
        ? form.situation_familiale
        : 'Célibataire', // fallback ou gérer comme erreur

      statut_collaborateur: String(form.statut_collaborateur),
      type_contrat: String(form.type_contrat),
      statut_contrat: String(form.statut_contrat),
    };
      const cleanedPayload = JSON.parse(JSON.stringify(payload));


      console.log('Payload:', payload);

        try {
        await addCollaborateur(cleanedPayload).unwrap();
        console.log('Collaborateur ajoute avec succès');
        navigate('/rh/collaborateurs');
      } catch (error) {
        console.error('Erreur dans Ajout :', error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l ajout.');
      console.error(err);
    }
  };

  return (
    <div className="p-8 font-nunito">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Ajouter un Collaborateur"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Collaborateurs' },
            { label: 'Ajouter', active: true }
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
              <Input value={form.nom_arabe} onChange={e => handleChange('nom_arabe', e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prénom (arabe)</label>
              <Input value={form.prenom_arabe} onChange={e => handleChange('prenom_arabe', e.target.value)} />
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
            <SelectField label="Statut collaborateur" value={form.statut_collaborateur} options={statutCollaborateurOptions} onChange={val => handleChange('statut_collaborateur', val)} />

          </div>

          {/* Source, Type de contrat, Statut du contrat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Source" value={form.source} options={sourceOptions} onChange={val => handleChange('source', val)} />
            <SelectField label="Type de contrat" value={form.type_contrat} options={typeContratOptions} onChange={val => handleChange('type_contrat', val)} />
            <SelectField label="Statut du contrat" value={form.statut_contrat} options={statutContratOptions} onChange={val => handleChange('statut_contrat', val)} />
          </div>

          {/* Date d’entrée, Date de sortie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField label="Date d’entrée" selected={dateEntree} onSelect={date => {
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

          {/* Période d’essai, Période de préavis, Nombre jours de congé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Période d’essai" type="number" value={form.periode_essai} onChange={val => handleChange('periode_essai', val)} />
            <InputField label="Période de préavis" type="number" value={form.periode_preavis} onChange={val => handleChange('periode_preavis', val)} />
            <InputField label="Nombre jours de congé" type="number" value={form.nombre_jours_conge} onChange={val => handleChange('nombre_jours_conge', val)} />
          </div>

          {/* Expérience totale, Expérience en éducation, Primes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Expérience totale" type="number" value={form.experience_totale} onChange={val => handleChange('experience_totale', val)} />
            <InputField label="Expérience en éducation" type="number" value={form.experience_education} onChange={val => handleChange('experience_education', val)} />
            <InputField label="Primes (panier, transport, etc.)" type="number" value={form.primes} onChange={val => handleChange('primes', val)} />
          </div>

          {/* Projet d’affectation, Région d’affectation, Province d’affectation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Projet d’affectation" value={form.projet_affectation} onChange={val => handleChange('projet_affectation', val)} />
            <SelectField label="Région d’affectation" value={form.region_affectation} options={regionOptions} onChange={val => handleChange('region_affectation', val)} />
            <SelectField label="Province d’affectation" value={form.province_affectation} options={provinceOptions} onChange={val => handleChange('province_affectation', val)} />
          </div>

          {/* Supérieur hiérarchique (link), Formation (diplôme), Discipline, Établissement */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField label="Supérieur hiérarchique" type="text" value={form.superieur_hierarchique} onChange={val => handleChange('superieur_hierarchique', val)} />
            <InputField label="Formation (diplôme)" value={form.formation} onChange={val => handleChange('formation', val)} />
            <InputField label="Discipline" value={form.discipline} onChange={val => handleChange('discipline', val)} />
            <InputField label="Établissement" value={form.etablissement} onChange={val => handleChange('etablissement', val)} />
          </div>

          {/* Date d’obtention */}
          <DatePickerField label="Date d’obtention" selected={dateObtention} onSelect={date => {
            setDateObtention(date);
            handleChange('date_obtention', date ? format(date, 'yyyy-MM-dd') : '');
          }} />

          {/* Situation familiale, Membre famille, Lien familial collaborateur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Situation familiale" value={form.situation_familiale} options={situationFamilialeOptions} onChange={val => handleChange('situation_familiale', val)} />
            <InputField label="Membre famille" value={form.membre_famille} onChange={val => handleChange('membre_famille', val)} />
            <InputField label="Lien familial collaborateur" value={form.lien_familial_collaborateur} onChange={val => handleChange('lien_familial_collaborateur', val)} />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-8 py-2 rounded-lg font-semibold shadow"
              onClick={() => navigate('/collaborateurs')}
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

export default AddCollaborateurs;

// Helper components for input, select, and datepicker fields to reduce repetition
interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  required?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
      required={required}
    />
  </div>
);

type SelectOption = string | { label: string; value: string | number };

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
}
const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Select value={value} onValueChange={onChange} required={required}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt =>
          typeof opt === 'string'
            ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            : <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
        )}
      </SelectContent>
    </Select>
  </div>
);

interface DatePickerFieldProps {
  label: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  required?: boolean;
}
const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, selected, onSelect }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          {selected ? format(selected, 'yyyy-MM-dd') : 'Sélectionner la date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  </div>
);
