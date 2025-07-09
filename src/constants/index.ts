// src/constants/menuData.js

// --- Main Menu Icons ---
import { MdOutlineCalculate, MdOutlineDashboard } from 'react-icons/md';
import { LiaHandshake } from 'react-icons/lia';
import { GoProjectRoadmap } from 'react-icons/go';
import { SlBookOpen, SlChart, SlGraph, SlPeople, SlDocs } from 'react-icons/sl';
import { CiShop, CiShuffle } from 'react-icons/ci';
import { BsCoin } from 'react-icons/bs';
import { IoLayersOutline, IoSettingsOutline } from 'react-icons/io5';
import { PiStudent } from 'react-icons/pi';
import { RiBriefcase4Line } from "react-icons/ri";
import { MdOutlineEvent } from "react-icons/md";
import { BiServer } from 'react-icons/bi';
import { TbVectorBezier } from 'react-icons/tb';

// --- Sub-Menu & Nested Icons ---
import {
    RiBarChartBoxLine,
    RiMoneyDollarCircleLine,
    RiGroupLine,
    RiBuildingLine,
    RiMapPinLine,
    RiHandCoinLine,
    RiAwardLine,
    RiTrophyLine,
    RiEditBoxLine,
    RiRefreshLine,
    RiBriefcaseLine,
    RiStackLine,
    RiBookOpenLine,
    RiCalendarLine,
    RiPlaneLine,
    RiSendPlaneLine,
    RiFileListLine,
    RiShieldLine,
    RiUmbrellaLine,
    RiUserLine,
    RiPriceTagLine,
    RiShoppingCartLine,
    RiListUnordered,
    RiBillLine,
    RiWalletLine,
    RiExchangeFundsLine,
    RiFilePaperLine,
    RiBuilding2Line,
    RiTeamLine,
    RiParentLine,
    RiStarLine,
    RiUserFollowLine,
    RiGraduationCapLine,
    RiCrosshairLine,
    RiInformationLine,
    RiBankLine,
    RiEarthLine,
    RiAccountBoxLine,
    RiOrganizationChart,
    RiLightbulbLine,
    RiBookLine,
    RiBookmarkLine,
    RiBarChartGroupedLine,
    RiSettings2Line,
} from 'react-icons/ri';
import { LuShieldX } from 'react-icons/lu';


export const menuItems = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        icon: MdOutlineDashboard,
        type: 'dropdown', // Top-level items with sub-items are dropdowns
        subItems: [
            { id: 'general', title: 'Général', link: '/dashboards/general', icon: null, type: 'link' },
            { id: 'finance-admin', title: 'Finance et administration', link: '/dashboards/finance-admin', icon: null, type: 'link' },
            { id: 'rh-dashboard', title: 'Ressources Humaines', link: '/dashboards/rh', icon: null, type: 'link' },
            { id: 'operations-dashboard', title: 'Opérations', link: '/dashboards/operations', icon: null, type: 'link' },
            { id: 'zakoura-academy', title: 'Zakoura Academy', link: '/dashboards/zakoura-academy', icon: null, type: 'link' },
            { id: 'achat-logistique', title: 'Achat et logistique', link: '/dashboards/achat-logistique', icon: null, type: 'link' },
        ],
    },
    {
        id: 'partenariat',
        title: 'Partenariat',
        icon: LiaHandshake,
        type: 'dropdown',
        subItems: [
            {
                id: 'prospections_dropdown',
                title: 'Prospection',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'partenaires', title: 'Partenaires', link: '/partenariat/partenaires', icon: RiAwardLine, type: 'link' },
                    { id: 'appels-a-projet', title: 'Appels à projet', link: '/partenariat/appels-a-projet', icon: RiTrophyLine, type: 'link' },
                ],
            },
            {
                id: 'suivi_partenaires_dropdown',
                title: 'Suivi des partenaires',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'reporting', title: 'Reporting', link: '/partenariat/reporting', icon: RiEditBoxLine, type: 'link' },
                    { id: 'recouvrements', title: 'Recouvrements', link: '/partenariat/recouvrements', icon: RiRefreshLine, type: 'link' },
                ],
            },
        ],
    },
    {
        id: 'projets',
        title: 'Projets',
        icon: GoProjectRoadmap,
        type: 'dropdown',
        subItems: [
            // This is the direct 'Projets' link under the main 'Projets' dropdown
          
              {
                id: 'finance_dropdown',
                title: 'Projets',
                type: 'dropdown',
                icon: null, // No icon visible next to 'Finance' in image_22c73e.png
                link: '/projets/liste', // This acts as a non-navigating parent for its own nested items
                nestedDropdownItems: [
                    { id: 'projets', title: 'Projets', link: '/projets/projets/projets', icon: RiBriefcase4Line, type: 'link' },
                    
                ],
            },
            // This is the 'Finance' dropdown which is a direct child of the main 'Projets' dropdown
            {
                id: 'projets_finance_dropdown',
                title: 'Finance',
                type: 'dropdown',
                icon: null, // No icon visible next to 'Finance' in image_22c73e.png
                link: '#', // This acts as a non-navigating parent for its own nested items
                nestedDropdownItems: [
                    { id: 'ressources-financieres', title: 'Ressources financières', link: '/projets/finance/ressources', icon: RiMoneyDollarCircleLine, type: 'link' },
                    { id: 'depenses', title: 'Dépenses', link: '/projets/finance/depenses', icon: RiExchangeFundsLine, type: 'link' },
                    { id: 'caisses', title: 'Caisses', link: '/projets/finance/caisses', icon: RiWalletLine, type: 'link' },
                ],
            },
        ],
    },
    {
        id: 'rh',
        title: 'RH',
        icon: SlPeople,
        type: 'dropdown',
        subItems: [
            {
                id: 'staff_dropdown', // Changed from header to dropdown
                title: 'Staff',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'collaborateurs', title: 'Collaborateurs', link: '/rh/collaborateurs', icon: RiGroupLine, type: 'link' },
                    { id: 'absences', title: 'Absences', link: '/rh/absences', icon: RiInformationLine, type: 'link' }, // Used RiInformationLine based on common usage
                    { id: 'conges', title: 'Congés', link: '/rh/conges', icon: RiPlaneLine, type: 'link' },
                    { id: 'ordres-de-mission', title: 'Ordres de mission', link: '/rh/ordres-de-mission', icon: RiSendPlaneLine, type: 'link' },
                    { id: 'demandes', title: 'Demandes', link: '/rh/demandes', icon: RiFileListLine, type: 'link' },
                    { id: 'dossiers-medicaux', title: 'Dossiers médicaux', link: '/rh/dossiers-medicaux', icon: RiUmbrellaLine, type: 'link' },
                ],
            },
            {
                id: 'appels_candidature_dropdown', // Changed from header to dropdown
                title: 'Les appels à candidature',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'appels-candidatures', title: 'Appels à candidatures', link: '/rh/appels-candidatures', icon: RiCrosshairLine, type: 'link' },
                    { id: 'candidats', title: 'Candidats', link: '/rh/candidats', icon: RiUserLine, type: 'link' },
                ],
            },
            {
                id: 'documents_admin_dropdown', // Changed from header to dropdown
                title: 'Documents administratifs',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'contrats', title: 'Contrats', link: '/rh/contrats', icon: SlDocs, type: 'link' },
                ],
            },
            {
                id: 'evaluations_rh_dropdown', // Changed from header to dropdown
                title: 'Evaluations',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'evalconceptions', title: 'Evalconceptions', link: '/rh/evalconceptions', icon: RiFileListLine, type: 'link' },
                    { id: 'evaluations_rh', title: 'Evaluations', link: '/rh/evaluations', icon: RiFileListLine, type: 'link' },
                ],
            },
           
        ],
    },
    {
        id: 'achats',
        title: 'Achats',
        icon: CiShop,
        type: 'dropdown',
        subItems: [
            {
                id: 'produits_dropdown', // Changed from header to dropdown
                title: 'Produits',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'marques', title: 'Marques', link: '/achats/marques', icon: RiPriceTagLine, type: 'link' },
                    { id: 'categories', title: 'Catégories', link: '/categories', icon: RiBriefcaseLine, type: 'link' },
                    { id: 'produits', title: 'Produits', link: '/achats/produits', icon: MdOutlineEvent, type: 'link' },
                    { id: 'packs', title: 'Packs', link: '/achats/packs', icon: RiStackLine, type: 'link' }, // Added link
                ],
            },
            {
                id: 'fournisseurs_dropdown', // Changed from header to dropdown
                title: 'Fournisseurs',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'fournisseurs', title: 'Fournisseurs', link: '/achats/fournisseurs', icon: RiShoppingCartLine, type: 'link' },
                ],
            },
            {
                id: 'commandes_dropdown', // Changed from header to dropdown
                title: 'Commandes',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'demandes-achats', title: "Demandes d'achats", link: '/achats/demandes-achats', icon: RiListUnordered, type: 'link' },
                    { id: 'devis', title: 'Devis', link: '/achats/devis', icon: RiListUnordered, type: 'link' },
                    { id: 'bons-de-commande', title: 'Bons de commande', link: '/achats/bons-de-commande', icon: RiListUnordered, type: 'link' },
                    { id: 'marches', title: 'Marchés', link: '/achats/marches', icon: RiListUnordered, type: 'link' },
                    { id: 'bons-de-reception', title: 'Bons de réception', link: '/achats/bons-de-reception', icon: RiListUnordered, type: 'link' },
                ],
            },
        ],
    },
    {
        id: 'approvisionnement',
        title: 'Approvisionnement',
        icon: MdOutlineDashboard, // Using Dashboard icon as a placeholder
        type: 'dropdown',
        subItems: [
            {
                id: 'approvisionnements_dropdown', // Changed from header to dropdown
                title: 'Approvisionnements',
                type: 'dropdown',
                icon: null, // As per image
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'bons-de-reception-app', title: 'Bons de réception', link: '/approvisionnement/bons-de-reception', icon: RiListUnordered, type: 'link' },
                    { id: 'bons-de-sortie', title: 'Bons de sortie', link: '/approvisionnement/bons-de-sortie', icon: RiListUnordered, type: 'link' },
                    { id: 'fiches-mise-a-disp', title: 'Fiches de mise à disposition', link: '/approvisionnement/fiches-mise-a-disp', icon: RiListUnordered, type: 'link' },
                    { id: 'bons-de-retour', title: 'Bons de retour', link: '/approvisionnement/bons-de-retour', icon: RiListUnordered, type: 'link' }, // Added link
                ],
            },
        ],
    },
    {
        id: 'finance',
        title: 'Finance',
        icon: BsCoin,
        type: 'dropdown',
        subItems: [
            // These are direct links within finance
            { id: 'factures', title: 'Factures', link: '/finance/factures', icon: RiBillLine, type: 'link' },
            { id: 'paiements', title: 'Paiements', link: '/finance/paiements', icon: RiWalletLine, type: 'link' },
            { id: 'operations-caisse', title: 'Opérations de caisse', link: '/finance/operations-caisse', icon: CiShuffle, type: 'link' },
            { id: 'notes-de-frais', title: 'Notes de frais', link: '/finance/notes-de-frais', icon: MdOutlineCalculate, type: 'link' },

           
        ],
    },
    {
        id: 'operations',
        title: 'Opérations',
        icon: IoLayersOutline,
        type: 'dropdown',
        subItems: [
            {
                id: 'prospections_finance_dropdown',
                title: 'Prospections',
                type: 'dropdown',
                icon: null,
                link: '#',
                nestedDropdownItems: [
                    { id: 'prospections_finance_link', title: 'Prospections', link: '/finance/prospections', icon: RiUserFollowLine, type: 'link' },
                    { id: 'unites_finance', title: 'Unités', link: '/finance/unites', icon: RiMapPinLine, type: 'link' },
                ],
            },
            {
                id: 'groupes_finance_dropdown',
                title: 'Groupes',
                type: 'dropdown',
                icon: null,
                link: '#',
                nestedDropdownItems: [
                    { id: 'groupes_finance_link', title: 'Groupes', link: '/finance/groupes', icon: RiGraduationCapLine, type: 'link' },
                    { id: 'niveaux_finance', title: 'Niveaux', link: '/finance/niveaux', icon: RiGraduationCapLine, type: 'link' },
                    { id: 'visites_finance', title: 'Visites', link: '/finance/visites', icon: RiStarLine, type: 'link' },
                ],
            },
            {
                id: 'beneficiaires_finance_dropdown',
                title: 'Bénéficiaires',
                type: 'dropdown',
                icon: null,
                link: '#',
                nestedDropdownItems: [
                    { id: 'beneficiaires_finance_link', title: 'Bénéficiaires', link: '/finance/beneficiaires', icon: RiGroupLine, type: 'link' },
                    { id: 'parents_finance', title: 'Parents', link: '/finance/parents', icon: RiParentLine, type: 'link' },
                    { id: 'absences-seance_finance', title: 'Absences de séance', link: '/finance/absences-seance', icon: RiInformationLine, type: 'link' },
                     { id: 's', title: 'Assurances', link: '/finance/assurances', icon: LuShieldX , type: 'link' },
                ],
            },
        ],
    },
    {
        id: 'academie',
        title: 'Académie',
        icon: PiStudent,
        type: 'dropdown',
        subItems: [
            {
                id: 'formations_dropdown', 
                title: 'Formations',
                type: 'dropdown',
                icon: null, 
                link: '#', 
                nestedDropdownItems: [
                    { id: 'formations', title: 'Formations', link: '/academie/formations', icon: RiBuilding2Line, type: 'link' },
                    { id: 'lieux', title: 'Lieux', link: '/academie/lieux', icon: RiMapPinLine, type: 'link' },
                ],
            },
            {
                id: 'participants_dropdown', 
                title: 'Participants',
                type: 'dropdown',
                icon: null,
                link: '#', 
                nestedDropdownItems: [
                    { id: 'participants', title: 'Participants', link: '/academie/participants', icon: RiGroupLine, type: 'link' },
                    { id: 'absences-seance-aca', title: 'Absences de séance', link: '/academie/absences-seance', icon: RiInformationLine, type: 'link' },
                    { id: 'assurances', title: 'Assurances', link: '/academie/assurances', icon: RiShieldLine, type: 'link' },
                    { id: 'notes-de-depenses', title: 'Notes de dépenses', link: '/academie/notes-de-depenses', icon: RiFilePaperLine, type: 'link' },
                ],
            },
            {
                id: 'prestataires_dropdown', 
                title: 'Prestataires',
                type: 'dropdown',
                icon: null, 
                link: '#', 
                nestedDropdownItems: [
                    { id: 'formateurs', title: 'Formateurs', link: '/academie/formateurs', icon: RiTeamLine, type: 'link' },
                ],
            },
        ],
    },
    {
        id: 'lab',
        title: 'LAB',
        icon: BiServer,
        link: '/lab',
        type: 'link', 
        subItems: [
            { id: 'conceptions-ops', title: 'Conceptions', link: '/operations/conceptions', icon: TbVectorBezier , type: 'link' },
            { id: 'evaluations-ops', title: 'Evaluations', link: '/operations/evaluations', icon: SlGraph , type: 'link' },
            { id: 'publications-ops', title: 'Publications', link: '/operations/publications', icon: SlBookOpen , type: 'link' },
            { id: 'sondages-ops', title: 'Sondages', link: '/operations/sondages', icon: SlChart , type: 'link' }, // Added link
        ],
    },
    {
        id: 'parametres',
        title: 'Paramètres',
        icon: IoSettingsOutline,
        type: 'dropdown', // Changed to dropdown since it now has sub-items
        subItems: [
            {
                id: 'projets_param',
                title: 'Projets',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'banques', title: 'Banques', link: '/parametres/projets/banques', icon: RiBankLine, type: 'link' },
                    { id: 'agences-bancaires', title: 'Agences bancaires', link: '/parametres/projets/agences-bancaires', icon: RiBankLine, type: 'link' },
                    { id: 'pays', title: 'Pays', link: '/parametres/projets/pays', icon: RiEarthLine, type: 'link' },
                ],
            },
            {
                id: 'operations_param',
                title: 'Opérations',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'sites', title: 'Sites', link: '/parametres/operations/sites', icon: RiBankLine, type: 'link' },
                    { id: 'agences-bancaires', title: 'Agences bancaires', link: '/parametres/projets/agences-bancaires', icon: RiBankLine, type: 'link' },
                    { id: 'pays', title: 'Pays', link: '/parametres/projets/pays', icon: RiEarthLine, type: 'link' },
                ],
            },
            {
                id: 'rh_param',
                title: 'RH',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'genres', title: 'Genres', link: '/parametres/rh/genres', icon: RiAccountBoxLine, type: 'link' },
                    { id: 'unites-organisationnelles', title: 'Unités organisationnelles', link: '/parametres/rh/unites-organisationnelles', icon: RiOrganizationChart, type: 'link' },
                    { id: 'postes', title: 'Postes', link: '/parametres/rh/postes', icon: RiBriefcase4Line, type: 'link' },
                    { id: 'situations', title: 'Situations', link: '/parametres/rh/situations', icon: RiGroupLine, type: 'link' },
                    { id: 'relations', title: 'Relations', link: '/parametres/rh/relations', icon: RiTeamLine, type: 'link' },
                    { id: 'sources', title: 'Sources', link: '/parametres/rh/sources', icon: RiLightbulbLine, type: 'link' },
                    {
                        id: 'diplomes_param_rh',
                        title: 'Diplômes',
                        type: 'dropdown',
                        icon: null, // No icon for the header
                        link: '#', // Non-navigating parent
                        nestedDropdownItems: [
                            { id: 'disciplines', title: 'Disciplines', link: '/parametres/rh/diplomes/disciplines', icon: RiBookLine, type: 'link' },
                            { id: 'niveaux', title: 'Niveaux', link: '/parametres/rh/diplomes/niveaux', icon: RiBookLine, type: 'link' },
                            { id: 'etablissements', title: 'Etablissements', link: '/parametres/rh/diplomes/etablissements', icon: RiBuilding2Line, type: 'link' },
                            { id: 'diplomes_list', title: 'Diplômes', link: '/parametres/rh/diplomes/list', icon: RiBookmarkLine, type: 'link' },
                        ],
                    },
                    {
                        id: 'statuts_rh',
                        title: 'Statuts',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'statuts-collaborateurs', title: 'Statuts des collaborateurs', link: '/parametres/rh/statuts/collaborateurs', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-conges', title: 'Statuts des congés', link: '/parametres/rh/statuts/conges', icon: RiBarChartGroupedLine, type: 'link' },
                        ],
                    },
                    {
                        id: 'types_rh',
                        title: 'Types',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'types-absences', title: "Types d'absences", link: '/parametres/rh/types/absences', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-ordres-mission', title: "Types des ordres de mission", link: '/parametres/rh/types/ordres-mission', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-demandes', title: "Types des demandes", link: '/parametres/rh/types/demandes', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-appels-candidatures', title: "Types d'appels à candidatures", link: '/parametres/rh/types/appels-candidatures', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-contrats', title: "Types de contrats", link: '/parametres/rh/types/contrats', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-unites-organisationnelles', title: "Types d'unités organisationnelles", link: '/parametres/rh/types/unites-organisationnelles', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-sources', title: "Types de sources", link: '/parametres/rh/types/sources', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-conges', title: "Types de congés", link: '/parametres/rh/types/conges', icon: RiSettings2Line, type: 'link' },
                        ],
                    },
                ],
            },
            {
                id: 'achats_param',
                title: 'Achats',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'unites_achats', title: 'Unités', link: '/parametres/achats/unites', icon: RiMapPinLine, type: 'link' },
                    {
                        id: 'statuts_achats',
                        title: 'Statuts',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'statuts-fiches-mise-a-disp', title: 'Statuts des fiches de mise à disposition', link: '/parametres/achats/statuts/fiches-mise-a-disp', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-bons-de-sortie', title: 'Statuts des bons de sortie', link: '/parametres/achats/statuts/bons-de-sortie', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-factures', title: 'Statuts des factures', link: '/parametres/achats/statuts/factures', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-packs', title: 'Statuts des packs', link: '/parametres/achats/statuts/packs', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-produits', title: 'Statuts des produits', link: '/parametres/achats/statuts/produits', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-bons-de-commande', title: 'Statuts des bons de commande', link: '/parametres/achats/statuts/bons-de-commande', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-demandes-d-achat', title: "Statuts des demandes d'achat", link: '/parametres/achats/statuts/demandes-d-achat', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-devis', title: 'Statuts des devis', link: '/parametres/achats/statuts/devis', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-bons-de-reception', title: 'Statuts des bons de réception', link: '/parametres/achats/statuts/bons-de-reception', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-bons-de-retour', title: 'Statuts des bons de retour', link: '/parametres/achats/statuts/bons-de-retour', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-fournisseurs', title: 'Statuts des fournisseurs', link: '/parametres/achats/statuts/fournisseurs', icon: RiBarChartGroupedLine, type: 'link' }, // inferred from position
                        ],
                    },
                    {
                        id: 'types_achats',
                        title: 'Types',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'types-produits', title: 'Types de produits', link: '/parametres/achats/types/produits', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-niveaux-urgence', title: "Types des niveaux d'urgence", link: '/parametres/achats/types/niveaux-urgence', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-fournisseurs', title: 'Types de fournisseurs', link: '/parametres/achats/types/fournisseurs', icon: RiSettings2Line, type: 'link' },
                        ],
                    },
                ],
            },
            {
                id: 'finance_param',
                title: 'Finance',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    {
                        id: 'statuts_finance',
                        title: 'Statuts',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'statuts-ressources-financieres', title: 'Statuts de ressources financières', link: '/parametres/finance/statuts/ressources-financieres', icon: RiBarChartGroupedLine, type: 'link' }, // inferred
                            { id: 'statuts-partenaires', title: 'Statuts des partenaires', link: '/parametres/finance/statuts/partenaires', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-appels-a-projets', title: 'Statuts des appels à projets', link: '/parametres/finance/statuts/appels-a-projets', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-projets', title: 'Statuts des projets', link: '/parametres/finance/statuts/projets', icon: RiBarChartGroupedLine, type: 'link' },
                            { id: 'statuts-sondages', title: 'Statuts des sondages', link: '/parametres/finance/statuts/sondages', icon: RiBarChartGroupedLine, type: 'link' },
                        ],
                    },
                    {
                        id: 'types_finance',
                        title: 'Types',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'types-ressources-financieres', title: 'Types de ressources financières', link: '/parametres/finance/types/ressources-financieres', icon: RiSettings2Line, type: 'link' },
                            { id: 'structures-partenaires', title: 'Structures de partenaires', link: '/parametres/finance/types/structures-partenaires', icon: RiSettings2Line, type: 'link' },
                            { id: 'natures-partenaires', title: 'Natures de partenaires', link: '/parametres/finance/types/natures-partenaires', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-projets', title: 'Types de projets', link: '/parametres/finance/types/projets', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-rubriques', title: 'Types de rubriques', link: '/parametres/finance/types/rubriques', icon: RiSettings2Line, type: 'link' },
                            { id: 'types-sondages', title: 'Types de sondages', link: '/parametres/finance/types/sondages', icon: RiSettings2Line, type: 'link' },
                        ],
                    },
                ],
            },
            {
                id: 'operations_param',
                title: 'Opérations',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'conceptions', title: 'Conceptions', link: '/parametres/operations/conceptions', icon: RiBarChartBoxLine, type: 'link' },
                    { id: 'evaluations', title: 'Evaluations', link: '/parametres/operations/evaluations', icon: RiBarChartBoxLine, type: 'link' },
                    { id: 'publications', title: 'Publications', link: '/parametres/operations/publications', icon: RiBookOpenLine, type: 'link' },
                    { id: 'sondages', title: 'Sondages', link: '/parametres/operations/sondages', icon: RiBarChartBoxLine, type: 'link' },
                ],
            },
            {
                id: 'academie_param',
                title: 'Académie',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    {
                        id: 'types_academie',
                        title: 'Types',
                        type: 'dropdown',
                        icon: null,
                        link: '#',
                        nestedDropdownItems: [
                            { id: 'types-formations', title: 'Types de formations', link: '/parametres/academie/types/formations', icon: RiSettings2Line, type: 'link' }, // Inferred
                            { id: 'types-lieux', title: 'Types de lieux', link: '/parametres/academie/types/lieux', icon: RiSettings2Line, type: 'link' }, // Inferred
                            { id: 'types-participants', title: 'Types de participants', link: '/parametres/academie/types/participants', icon: RiSettings2Line, type: 'link' }, // Inferred
                            { id: 'types-prestataires', title: 'Types de prestataires', link: '/parametres/academie/types/prestataires', icon: RiSettings2Line, type: 'link' }, // Inferred
                        ],
                    },
                ],
            },
            {
                id: 'general_param',
                title: 'Général',
                type: 'dropdown',
                icon: null, // No icon for the header
                link: '#', // Non-navigating parent
                nestedDropdownItems: [
                    { id: 'langues', title: 'Langues', link: '/parametres/general/langues', icon: RiEarthLine, type: 'link' }, // Inferred
                    { id: 'devises', title: 'Devises', link: '/parametres/general/devises', icon: RiMoneyDollarCircleLine, type: 'link' }, // Inferred
                ],
            },
        ],
    },
];