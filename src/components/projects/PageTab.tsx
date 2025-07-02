import { Button } from "../ui/button";

export const PageTab = ({ projectTitle, activeTab, setActiveTab }: { projectTitle: string; activeTab: string; setActiveTab: (tab: string) => void; }) => (
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