import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetProjectQuery } from "@/features/api/projectsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Users,
  UserCheck,
  MapPin,
  Shield,
  Wallet,
  Store,
  Calculator,
  Monitor,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import { Badge } from "@/components/ui/badge";
import { PageHeaderLayout } from "@/layouts/MainLayout";




const TABS = [
  { key: "INFOS", label: "INFOS" },
  { key: "TACHES", label: "TÂCHES" },
  { key: "COLLABORATEURS", label: "COLLABORATEURS" },
  { key: "DOCUMENTS", label: "DOCUMENTS" },
  { key: "LOCALITE", label: "LOCALITÉ" },
];

// ShortcutsCard component
const ShortcutsCard = () => (
  <Card className="shadow bg-white  w-full rounded-2xl">
    <CardContent className="p-8">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Raccourcis</h2>
      <div className="grid grid-cols-2 gap-y-8 gap-x-12">
        <Link to="/achats" className="flex items-center gap-4 group">
          <Store className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Demandes d'achats
          </span>
        </Link>
        <Link to="/prospection" className="flex items-center gap-4 group">
          <BarChart2 className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Prospections
          </span>
        </Link>
        <Link to="/frais" className="flex items-center gap-4 group">
          <Calculator className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Notes de frais
          </span>
        </Link>
        <Link to="/sondages" className="flex items-center gap-4 group">
          <Monitor className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Sondages
          </span>
        </Link>
        <Link to="/candidatures" className="flex items-center gap-4 group">
          <UserPlus className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Appels à candidatures
          </span>
        </Link>
        <Link to="/formations" className="flex items-center gap-4 group">
          <GraduationCap className="w-10 h-10 text-blue-900 group-hover:text-blue-600 transition" />
          <span className="text-base text-gray-700 group-hover:text-blue-600 transition">
            Formations
          </span>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  const stats = [
    {
      icon: <BarChart2 className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Prospections",
      value: 0,
    },
    {
      icon: <Users className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Collaborateurs",
      value: 44,
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Bénéficiaires",
      value: 0,
    },
    {
      icon: <MapPin className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Localité",
      value: 0,
    },
    {
      icon: <UserCheck className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Groupes",
      value: 0,
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-900 mb-2" />,
      label: "Nbr des assurés",
      value: 0,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="flex flex-col items-center justify-center py-8 shadow bg-white rounded-2xl"
        >
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
  const { data: project, isLoading, isError } = useGetProjectQuery(Number(id));
  const [activeTab, setActiveTab] = React.useState("INFOS");
  console.log(project);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-blue-900">
        Chargement du projet...
      </div>
    );
  }
  if (isError || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-600">
        Erreur lors du chargement du projet.
      </div>
    );
  }

  console.log(`this is the prooooooject`, project);
  // Example stats (replace with real fields if available)
  

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeaderLayout
          title="Détails du projet"
          breadcrumbs={[
            { label: "Tableaux de bord" },
            { label: "Projets" },
            { label: "Afficher", active: true },
          ]}
        />
        <Button onClick={() => navigate(-1)} variant="outline">
          Retour
        </Button>
      </div>
      {/* Nav Tabs */}
      <nav className="flex space-x-8 border-b border-gray-200 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-1 text-base font-semibold tracking-wide transition-colors duration-200 border-b-2 focus:outline-none
              ${
                activeTab === tab.key
                  ? "text-blue-900 border-blue-900"
                  : "text-gray-400 border-transparent hover:text-blue-900"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Tab Content */}
      {activeTab === "INFOS" && (
        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section */}
            <div className="lg:col-span-6 space-y-6">
              {/* Wallet Card */}

              <Card>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Nom du projet</p>
                    <p className="font-bold text-lg text-gray-800">
                      {project.project_name}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <Badge variant={"outline"}>
                      {project.project_type?.name || "-"}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Statut</p>
                    <Badge variant={"outline"}>
                      {project.project_status?.name || "-"}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Dates</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <span className="font-semibold">Date de début :</span>{" "}
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Date de début réelle :
                        </span>{" "}
                        {project.actual_start_date
                          ? new Date(
                              project.actual_start_date
                            ).toLocaleDateString("fr-FR")
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Date de clôture :</span>{" "}
                        {project.end_date
                          ? new Date(project.end_date).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-700">
                      {project.total_budget
                        ? `${project.total_budget} MAD`
                        : "-"}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Bénéficiaires</p>
                    <p className="font-semibold text-gray-700">{"-"}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    variant="outline"
                    className="w-full bg-gray-100 mt-4 cursor-pointer"
                  >
                    Modifier le projet
                  </Button>
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
                  <p className="text-xs text-gray-500 mb-2">
                    Notes & Observations
                  </p>
                  <div className="text-gray-700 text-sm whitespace-pre-line min-h-[60px]">
                    {project.notes ? (
                      project.notes
                    ) : (
                      <span className="italic text-gray-400">
                        Aucune note fournie.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow border-l-4 border-green-200 bg-white">
                <CardContent className="p-6">
                  <p className="text-xs text-gray-500 mb-2">
                    Compte Bancaire du Projet
                  </p>
                  {project.project_bank_account ? (
                    <div className="space-y-2">
                      <div>
                        <span className="block text-xs text-gray-400">RIB</span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.project_bank_account.rib_iban || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">
                          Agence
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.project_bank_account.agency || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">
                          Banque
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.project_bank_account.bank || "-"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400">
                      Aucun compte bancaire renseigné.
                    </span>
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
                    <p className="text-xs text-gray-500 mb-2">
                      Informations complémentaires
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="block text-xs text-gray-400">
                          Nature du projet
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.project_nature || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">
                          Contribution Zakoura
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.zakoura_contribution
                            ? `${project.zakoura_contribution} MAD`
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">
                          Responsable
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.responsible?.name || "-"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {project.responsible?.email || ""}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400">
                          Créé par
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {project.created_by?.name || "-"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {project.created_by?.email || ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      )}
      {activeTab !== "INFOS" && (
        <div className="p-12 text-center text-gray-400 text-lg font-semibold">
          Contenu de l'onglet "{TABS.find((t) => t.key === activeTab)?.label}" à
          venir.
        </div>
      )}
    </div>
  );
};

export default ShowProject;
