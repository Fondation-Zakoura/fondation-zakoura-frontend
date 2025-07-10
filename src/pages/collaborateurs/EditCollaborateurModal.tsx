import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  useGetCollaborateurQuery,
  useUpdateCollaborateurMutation,
} from '@/features/api/CollaborateursApi';
import { PageHeaderLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const initialForm = {
  civilite: '',
  nom: '',
  prenom: '',
  email: '',
  cin: '',
  telephone: '',
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
  source: '',
  date_entree: '',
  salaire_brut: '',
  salaire_net: '',
  periode_essai: '',
  periode_preavis: '',
  nombre_jours_conge: '',
  projet_affectation: '',
  region_affectation: '',
  province_affectation: '',
  superieur_hierarchique: '',
  situation_familiale: '',
  statut_collaborateur: '',
  type_contrat: '',
  statut_contrat: '',
};

const EditCollaborateur: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: collaborateur, isLoading } = useGetCollaborateurQuery(id);
  const [updateCollaborateur] = useUpdateCollaborateurMutation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (collaborateur) {
      setForm({
        civilite: collaborateur.civilite || '',
        nom: collaborateur.nom || '',
        prenom: collaborateur.prenom || '',
        email: collaborateur.email || '',
        cin: collaborateur.cin || '',
        telephone: collaborateur.telephone || '',
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
        source: collaborateur.source || '',
        date_entree: collaborateur.date_entree || '',
        salaire_brut: collaborateur.salaire_brut !== null && collaborateur.salaire_brut !== undefined ? String(collaborateur.salaire_brut) : '',
        salaire_net: collaborateur.salaire_net !== null && collaborateur.salaire_net !== undefined ? String(collaborateur.salaire_net) : '',
        periode_essai: collaborateur.periode_essai !== null && collaborateur.periode_essai !== undefined ? String(collaborateur.periode_essai) : '',
        periode_preavis: collaborateur.periode_preavis !== null && collaborateur.periode_preavis !== undefined ? String(collaborateur.periode_preavis) : '',
        nombre_jours_conge: collaborateur.nombre_jours_conge !== null && collaborateur.nombre_jours_conge !== undefined ? String(collaborateur.nombre_jours_conge) : '',
        projet_affectation: collaborateur.projet_affectation || '',
        region_affectation: collaborateur.region_affectation || '',
        province_affectation: collaborateur.province_affectation || '',
        superieur_hierarchique: collaborateur.superieur_hierarchique !== null && collaborateur.superieur_hierarchique !== undefined ? String(collaborateur.superieur_hierarchique) : '',
        situation_familiale: collaborateur.situation_familiale || '',
        statut_collaborateur: collaborateur.statut_collaborateur !== null && collaborateur.statut_collaborateur !== undefined ? String(collaborateur.statut_collaborateur) : '',
        type_contrat: collaborateur.type_contrat !== null && collaborateur.type_contrat !== undefined ? String(collaborateur.type_contrat) : '',
        statut_contrat: collaborateur.statut_contrat !== null && collaborateur.statut_contrat !== undefined ? String(collaborateur.statut_contrat) : '',
     
      });
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
    nom: String(form.nom).trim(),
    prenom: String(form.prenom).trim(),
    email: String(form.email).trim(),
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
    await updateCollaborateur({ code: String(cleanedPayload.id), body: cleanedPayload }).unwrap();
    console.log('Collaborateur updated');
  } catch (error) {
    console.error('Erreur de mise à jour :', error);
  }
    navigate('/rh/collaborateurs');
  } catch (err) {
    setError('Une erreur est survenue lors de la mise à jour.');
    console.error(err);
  }
};



  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="p-8 font-nunito">
      <PageHeaderLayout
        title="Modifier un Collaborateur"
        breadcrumbs={[
          { label: 'Tableaux de bord' },
          { label: 'Collaborateurs' },
          { label: 'Modifier', active: true },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        <Card className="p-8 space-y-6">
          <InputField label="Nom" value={form.nom} onChange={val => handleChange('nom', val)} required />
          <InputField label="Prénom" value={form.prenom} onChange={val => handleChange('prenom', val)} required />
          <InputField label="Email" value={form.email} onChange={val => handleChange('email', val)} required />
          <InputField label="Téléphone" value={form.telephone} onChange={val => handleChange('telephone', val)} />
          <InputField label="CIN" value={form.cin} onChange={val => handleChange('cin', val)} />
          <SelectField
            label="Civilité"
            value={form.civilite}
            options={['Monsieur', 'Madame']}
            onChange={val => handleChange('civilite', val)}
          />
          <DatePickerField
            label="Date de naissance"
            selected={form.date_naissance ? new Date(form.date_naissance) : undefined}
            onSelect={date => handleChange('date_naissance', date ? format(date, 'yyyy-MM-dd') : '')}
          />
          <InputField label="Banque" value={form.banque} onChange={val => handleChange('banque', val)} />
          <InputField label="RIB" value={form.rib} onChange={val => handleChange('rib', val)} />
          <InputField label="Région de naissance" value={form.region_naissance} onChange={val => handleChange('region_naissance', val)} />
          <InputField label="Province de naissance" value={form.province_naissance} onChange={val => handleChange('province_naissance', val)} />
          <InputField label="Adresse de résidence" value={form.adresse_residence} onChange={val => handleChange('adresse_residence', val)} />
          <InputField label="Région de résidence" value={form.region_residence} onChange={val => handleChange('region_residence', val)} />
          <InputField label="Province de résidence" value={form.province_residence} onChange={val => handleChange('province_residence', val)} />
          <InputField label="Unité organisationnelle" value={form.unite_organisationnelle} onChange={val => handleChange('unite_organisationnelle', val)} />
          <InputField label="Poste" value={form.poste} onChange={val => handleChange('poste', val)} />
          <InputField label="Source" value={form.source} onChange={val => handleChange('source', val)} />
          <DatePickerField
            label="Date d'entrée"
            selected={form.date_entree ? new Date(form.date_entree) : undefined}
            onSelect={date => handleChange('date_entree', date ? format(date, 'yyyy-MM-dd') : '')}
          />
          <InputField label="Salaire Brut" type="number" value={form.salaire_brut} onChange={val => handleChange('salaire_brut', val)} />
          <InputField label="Salaire Net" type="number" value={form.salaire_net} onChange={val => handleChange('salaire_net', val)} />
          <InputField label="Période d'essai" type="number" value={form.periode_essai} onChange={val => handleChange('periode_essai', val)} />
          <InputField label="Période de préavis" type="number" value={form.periode_preavis} onChange={val => handleChange('periode_preavis', val)} />
          <InputField label="Nombre jours de congé" type="number" value={form.nombre_jours_conge} onChange={val => handleChange('nombre_jours_conge', val)} />
          <InputField label="Projet d'affectation" value={form.projet_affectation} onChange={val => handleChange('projet_affectation', val)} />
          <InputField label="Région d'affectation" value={form.region_affectation} onChange={val => handleChange('region_affectation', val)} />
          <InputField label="Province d'affectation" value={form.province_affectation} onChange={val => handleChange('province_affectation', val)} />
          <InputField label="Supérieur hiérarchique" value={form.superieur_hierarchique} onChange={val => handleChange('superieur_hierarchique', val)} />
          <SelectField
            label="Situation familiale"
            value={form.situation_familiale}
            options={['Célibataire', 'Marié', 'Divorcé', 'Veuf']}
            onChange={val => handleChange('situation_familiale', val)}
          />
          <SelectField
            label="Statut collaborateur"
            value={form.statut_collaborateur}
            options={['1', '2']} // Remplacer par options réelles (ex: 'Actif', 'Inactif' avec valeurs)
            onChange={val => handleChange('statut_collaborateur', val)}
          />
          <SelectField
            label="Type contrat"
            value={form.type_contrat}
            options={['1', '2', '3']} // Remplacer par options réelles (ex: 'CDI', 'CDD', 'Stage' avec valeurs)
            onChange={val => handleChange('type_contrat', val)}
          />
          <SelectField
            label="Statut contrat"
            value={form.statut_contrat}
            options={['1', '2']} // Remplacer par options réelles
            onChange={val => handleChange('statut_contrat', val)}
          />


          <div className="flex justify-end gap-4 mt-4">
            <Button type="button" onClick={() => navigate('/rh/collaborateurs')} className="bg-gray-200 hover:bg-gray-300 text-gray-700">
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white">
              Enregistrer
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </Card>
      </form>
    </div>
  );
};

export default EditCollaborateur;

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      required={required}
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface DatePickerFieldProps {
  label: string;
  selected?: Date;
  onSelect: (date?: Date) => void;
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
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  </div>
);
