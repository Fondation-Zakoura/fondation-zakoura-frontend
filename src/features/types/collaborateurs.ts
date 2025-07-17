export type Collaborateur = {
  id: number;
  nom: string;
  prenom: string;
  nomArabe?: string | null;
  prenomArabe?: string | null;
  email: string;
  password?: string; // facultatif à la modification
  cin: string;
  cnss?: string | null;
  cimr?: string | null;
  n_adhesion_assurance?: string | null;
  civilite: string;
  telephone: string;
  banque: string;
  rib: string;
  date_naissance: string;
  region_naissance: string;
  province_naissance: string;
  adresse_residence: string;
  region_residence: string;
  province_residence: string;
  unite_organisationnelle: string;
  poste: string;
  source: string;
  date_entree: string;
  date_sortie: string;
  salaire_brut: number;
  salaire_net: number;
  periode_essai: number;
  periode_preavis: number;
  experience_totale?: number | null;
  experience_education?: number | null;
  primes?: number | null;
  nombre_jours_conge: number;
  projet_affectation: string;
  region_affectation: string;
  province_affectation: string;
  formation?: string | null;
  discipline?: string | null;
  etablissement?: string | null;
  date_obtention?: string | null;
  membre_famille?: string | null;
  lien_familial_collaborateur?: string | null;
  superieur_hierarchique?: number | null;
  situation_familiale: string;
  statut_collaborateur_id: number;
  type_contrat_id: number;
  statut_contrat_id: number;
  photo?: File | string | null;
  created_at?: string;
  updated_at?: string;
};
export type CollaborateursResponse = {
  data: Collaborateur[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    total_pages: number;
  };
};
export type CollaborateurFormOptions = {
  statuts: Array<{
    id: number;
    label: string;
  }>;
  types_contrat: Array<{
    id: number;
    label: string;
  }>;
  statuts_contrat: Array<{
    id: number;
    label: string;
  }>;
  superieurs: Array<{
    id: number;
    nom_complet: string;
  }>;
};
export type CollavorateurStatusResponse = {
  id: number;
  type: string;
}
