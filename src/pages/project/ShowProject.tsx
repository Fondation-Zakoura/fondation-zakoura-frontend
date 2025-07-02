import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetProjectQuery } from '@/features/api/projectsApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BarChart2, Users, UserCheck, MapPin, Shield, Layers, FileText, ClipboardList, Megaphone, BookOpen, StickyNote, Wallet, Store, Calculator, Monitor, UserPlus, GraduationCap } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from '@/components/ui/badge';
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { PageHeaderLayout } from '@/layouts/MainLayout';

// --- Helper Components for better structure & styling ---

const PageHeader = ({ projectTitle, activeTab, setActiveTab }: { projectTitle: string; activeTab: string; setActiveTab: (tab: string) => void; }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{projectTitle}</h1>
        <p className="text-sm text-gray-500">Tableaux de bord | Projets</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Modifier le projet</Button>
    </div>
    <div className="border-b border-gray-200">
      {/* Interactive Navigation Tabs */}
      <nav className="flex space-x-6">
        {['INFOS', 'TÂCHES', 'COLLABORATEURS', 'DOCUMENTS', 'LOCALITÉ'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)} // Set the active tab on click
            className={cn(
              "py-3 px-1 text-sm font-medium transition-colors duration-200",
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600" // Style for the active tab
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent" // Style for inactive tabs
            )}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card className="text-center shadow-sm border border-gray-100 bg-white min-h-[70px]">
    <CardContent className="p-2 flex flex-col items-center justify-center">
      <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </CardContent>
  </Card>
);

const AnalyticsCard = ({ title, percentage, footerText, color }: { title: string; percentage: number; footerText: string; color: string; }) => (
  <Card className="flex flex-col items-center justify-center py-4 shadow-sm border border-blue-100 bg-white">
    <CardContent className="flex flex-col items-center justify-center gap-2 p-2">
      <p className="text-xs text-gray-500 mb-1 text-center">{title}</p>
      <div className="w-16 h-16 mb-1">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: '#00365A',
            pathColor: color,
            trailColor: '#e5e7eb',
            textSize: '1.1rem',
            strokeLinecap: 'round',
          })}
        />
      </div>
      <p className="text-xs text-gray-400 text-center mt-0.5">{footerText}</p>
    </CardContent>
  </Card>
);

const ShortcutItem = ({ icon, label }: { icon: React.ReactNode; label: string; }) => (
    <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
            {icon}
        </div>
        <span className="mt-2 text-xs font-medium text-gray-600">{label}</span>
    </div>
);

const TABS = [
  { key: 'INFOS', label: 'INFOS' },
  { key: 'TACHES', label: 'TÂCHES' },
  { key: 'COLLABORATEURS', label: 'COLLABORATEURS' },
  { key: 'DOCUMENTS', label: 'DOCUMENTS' },
  { key: 'LOCALITE', label: 'LOCALITÉ' },
];

// ShortcutsCard component
const ShortcutsCard = () => (
  <Card className="shadow bg-white  w-full rounded-2xl">
    <CardContent className="p-8">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Raccourcis</h2>
      <div className="grid grid-cols-2 gap-y-8 gap-x-12">
        <Link to="/achats" className="flex items-center gap-4 group">
          <Store className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Demandes d'achats</span>
        </Link>
        <Link to="/prospection" className="flex items-center gap-4 group">
          <BarChart2 className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Prospections</span>
        </Link>
        <Link to="/frais" className="flex items-center gap-4 group">
          <Calculator className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Notes de frais</span>
        </Link>
        <Link to="/sondages" className="flex items-center gap-4 group">
          <Monitor className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Sondages</span>
        </Link>
        <Link to="/candidatures" className="flex items-center gap-4 group">
          <UserPlus className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Appels à candidatures</span>
        </Link>
        <Link to="/formations" className="flex items-center gap-4 group">
          <GraduationCap className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">Formations</span>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// DashboardStats component
const DashboardStats = () => {
  const stats = [
    {
      icon: <BarChart2 className="w-10 h-10 text-blue-900 mb-2" />, label: "Prospections", value: 0
    },
    {
      icon: <Users className="w-10 h-10 text-blue-900 mb-2" />, label: "Collaborateurs", value: 44
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-blue-900 mb-2" />, label: "Bénéficiaires", value: 0
    },
    {
      icon: <MapPin className="w-10 h-10 text-blue-900 mb-2" />, label: "Localité", value: 0
    },
    {
      icon: <UserCheck className="w-10 h-10 text-blue-900 mb-2" />, label: "Groupes", value: 0
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-900 mb-2" />, label: "Nbr des assurés", value: 0
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex flex-col items-center justify-center py-8 shadow bg-white rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center">
            {stat.icon}
            <div className="text-gray-500 text-base mb-1">{stat.label}</div>
            <div className="text-blue-900 text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Main Component ---

const ShowProject: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useGetProjectQuery(id as string);
  const [activeTab, setActiveTab] = React.useState('INFOS');

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-blue-900">Chargement du projet...</div>;
  }
  if (isError || !project) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-600">Erreur lors du chargement du projet.</div>;
  }
  // Example stats (replace with real fields if available)
  const stats = [
    { label: 'Type', value: project.project.project_type?.name || '-' },
    { label: 'Statut', value: project.project.project_status?.name || '-' },
    { label: 'Bénéficiaires', value: project.beneficiaries ?? '-' },
    { label: 'Localité', value: project.location || '-' },
    { label: 'Budget', value: project.project.total_budget ? `${project.project.total_budget} MAD` : '-' },
    { label: 'Créé le', value: project.project.created_at ? new Date(project.project.created_at).toLocaleDateString() : '-' },
  ];  
  const iconClass = 'w-6 h-6 text-blue-600';

  // Définis le type localement
  type GanttTask = {
    id: string;
    name: string;
    start: Date;
    end: Date;
    type: string;
    progress: number;
    isDisabled?: boolean;
    styles?: {
      progressColor?: string;
      progressSelectedColor?: string;
    };
  };

  const tasks: GanttTask[] = [
    {
      id: project.project.project_code,
      name: project.project.project_name || project.title,
      start: new Date(project.project.start_date),
      end: new Date(project.project.end_date),
      type: "task",
      progress: 100,
      isDisabled: true,
      styles: { progressColor: "#2563eb", progressSelectedColor: "#1d4ed8" }
    }
  ];
  
  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Détails du projet"
          breadcrumbs={[
            { label: 'Tableaux de bord' },
            { label: 'Projets' },
            { label: 'Afficher', active: true }
          ]}
        />
        <Button onClick={() => navigate(-1)} variant="outline">Retour</Button>
      </div>
      {/* Nav Tabs */}
      <nav className="flex space-x-8 border-b border-gray-200 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-1 text-base font-semibold tracking-wide transition-colors duration-200 border-b-2 focus:outline-none
              ${activeTab === tab.key
                ? 'text-blue-900 border-blue-900'
                : 'text-gray-400 border-transparent hover:text-blue-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Tab Content */}
      {activeTab === 'INFOS' && (
        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section */}
            <div className="lg:col-span-6 space-y-6">
              {/* Wallet Card */}
              
              <Card>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Nom du projet</p>
                    <p className="font-bold text-lg text-gray-800">{project.project.project_name}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <Badge>{project.project.project_type?.name || '-'}</Badge>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Statut</p>
                    <Badge>{project.project.project_status?.name || '-'}</Badge>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Dates</p>
                    <p className="font-semibold text-gray-700">{project.project.start_date?.slice(0, 10)} - {project.project.end_date?.slice(0, 10)}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-700">{project.project.total_budget ? `${project.project.total_budget} MAD` : '-'}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Bénéficiaires</p>
                    <p className="font-semibold text-gray-700">{project.beneficiaries ?? '-'}</p>
                  </div>
                  <Button size="sm" onClick={()=>navigate(`/projects/${project.project.id}/edit`)} variant="outline" className="w-full bg-gray-100 mt-4 cursor-pointer">Modifier le projet</Button>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg flex flex-col  justify-between p-6 w-full ">
                <div className="flex items-center gap-4">
                  <Wallet className="w-10 h-10 text-white" />
                  <div>
                    <div className="text-3xl font-bold">0.00</div>
                    <div className="text-sm">Solde</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-6">
                  <Button
                    variant="outline"
                    className="border-white text-blue-500 hover:bg-white/10 hover:text-white rounded-full"
                  >
                    Achats depuis la caisse
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-blue-500 hover:bg-white/10 hover:text-white rounded-full"
                  >
                    Alimentation de la caisse
                  </Button>
                </div>
              </Card>
              <Card className="shadow border-l-4 border-blue-200 bg-white">
                <CardContent className="p-6">
                  <p className="text-xs text-gray-500 mb-2">Notes & Observations</p>
                  <div className="text-gray-700 text-sm whitespace-pre-line min-h-[60px]">
                    {project.project.notes ? project.project.notes : <span className="italic text-gray-400">Aucune note fournie.</span>}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow border-l-4 border-green-200 bg-white">
                <CardContent className="p-6">
                  <p className="text-xs text-gray-500 mb-2">Compte Bancaire du Projet</p>
                  {project.project.project_bank_account ? (
                    <div className="space-y-2">
                      <div>
                        <span className="block text-xs text-gray-400">RIB</span>
                        <span className="font-semibold text-gray-800 text-sm">{project.project.project_bank_account.rib || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">Agence</span>
                        <span className="font-semibold text-gray-800 text-sm">{project.project.project_bank_account.agency || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">Banque</span>
                        <span className="font-semibold text-gray-800 text-sm">{project.project.project_bank_account.bank || '-'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400">Aucun compte bancaire renseigné.</span>
                  )}
                </CardContent>
              </Card>
              
              
            </div>
            {/* Right Section */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <DashboardStats />
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {/* Placeholder for Gantt or other widgets */}
                
                <ShortcutsCard />
                <Card className="shadow border-l-4 border-yellow-200 bg-white">
                <CardContent className="p-6">
                  <p className="text-xs text-gray-500 mb-2">Informations complémentaires</p>
                  <div className="space-y-2">
                    <div>
                      <span className="block text-xs text-gray-400">Nature du projet</span>
                      <span className="font-semibold text-gray-800 text-sm">{project.project.project_nature || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Contribution Zakoura</span>
                      <span className="font-semibold text-gray-800 text-sm">{project.project.zakoura_contribution ? `${project.project.zakoura_contribution} MAD` : '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Responsable</span>
                      <span className="font-semibold text-gray-800 text-sm">{project.project.responsible?.name || '-'}</span>
                      <span className="block text-xs text-gray-500">{project.project.responsible?.email || ''}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Créé par</span>
                      <span className="font-semibold text-gray-800 text-sm">{project.project.created_by?.name || '-'}</span>
                      <span className="block text-xs text-gray-500">{project.project.created_by?.email || ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
          <Gantt
            tasks={tasks}
            viewMode={"Month"}
            listCellWidth="155px"
            columnWidth={60}
          />
        </main>
      )}
      {activeTab !== 'INFOS' && (
        <div className="p-12 text-center text-gray-400 text-lg font-semibold">
          
          Contenu de l'onglet "{TABS.find(t => t.key === activeTab)?.label}" à venir.
        </div>
      )}
    </div>
  );
};

export default ShowProject;
