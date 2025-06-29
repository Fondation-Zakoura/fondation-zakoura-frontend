
// src/constants/menuData.js

// --- Main Menu Icons ---
import { MdOutlineDashboard } from 'react-icons/md';
import { LiaHandshake } from 'react-icons/lia';
import { GoProjectRoadmap } from 'react-icons/go';
import { SlBookOpen, SlChart, SlGraph, SlPeople, SlDocs } from 'react-icons/sl';
import { CiShop } from 'react-icons/ci';
import { BsCoin } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { PiStudent } from 'react-icons/pi';

import { BiServer } from 'react-icons/bi';
import { TbVectorBezier } from 'react-icons/tb';

// --- Sub-Menu & Nested Icons ---
import {
    RiBarChartBoxLine,
    RiGroupLine,
    RiMapPinLine,
    RiAwardLine,
    RiTrophyLine,
    RiEditBoxLine,
    RiRefreshLine,
    RiBriefcaseLine,
    RiStackLine,
    RiBookOpenLine,
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
} from 'react-icons/ri';
import { LucideShieldX } from 'lucide-react';


export const menuItems = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        icon: MdOutlineDashboard,
        type: 'dropdown', 
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
                    { id: 'partenaires', title: 'Partenaires', link: '/partners', icon: RiAwardLine, type: 'link' },
                    { id: 'projets', title: 'Projets', link: '/projects', icon: RiAwardLine, type: 'link' },
                    { id: 'appels-a-projet', title: 'Appels à projet', link: '/partenariat/appels-a-projet', icon: RiTrophyLine, type: 'link' },
                ],
            },
            {
                id: 'suivi_partenaires_dropdown',
                title: 'Suivi des partenaires',
                type: 'dropdown',
                icon: null,
                link: '#', 
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
            { id: 'conceptions', title: 'Conceptions', link: '/projets/conceptions', icon: RiBarChartBoxLine, type: 'link' },
            { id: 'evaluations', title: 'Evaluations', link: '/projets/evaluations', icon: RiBarChartBoxLine, type: 'link' },
            { id: 'publications', title: 'Publications', link: '/projets/publications', icon: RiBookOpenLine, type: 'link' },
            { id: 'sondages', title: 'Sondages', link: '/projets/sondages', icon: RiBarChartBoxLine, type: 'link' },
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
                    { id: 'categories', title: 'Catégories', link: '/achats/categories', icon: RiBriefcaseLine, type: 'link' },
                    { id: 'produits', title: 'Produits', link: '/achats/produits', icon: RiStackLine, type: 'link' },
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
            { id: 'operations-caisse', title: 'Opérations de caisse', link: '/finance/operations-caisse', icon: RiExchangeFundsLine, type: 'link' },
            { id: 'notes-de-frais', title: 'Notes de frais', link: '/finance/notes-de-frais', icon: RiFilePaperLine, type: 'link' },

            // These are already correctly structured as dropdowns with nestedDropdownItems
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
                     { id: 's', title: 'Assurances', link: '/finance/assurances', icon: LucideShieldX , type: 'link' },
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
        link: '/parametres',
        type: 'link', // No sub-items, so type is 'link'
        // subItems: [], // No need to explicitly define empty subItems array
    },
];
