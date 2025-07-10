export type Collaborateur = {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password?: string;
  cin: string;
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
  date_entree?: string | null;
  salaire_brut: number;
  salaire_net: number;
  periode_essai: number;
  periode_preavis: number;
  nombre_jours_conge: number;
  projet_affectation: string;
  region_affectation: string;
  province_affectation: string;
  superieur_hierarchique?: number | null;
  situation_familiale: string;
  statut_collaborateur: number;
  type_contrat: number;
  statut_contrat: number;
  created_at?: string;
  updated_at?: string;
};

export type CollaborateursResponse = {
  data: Collaborateur[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
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
