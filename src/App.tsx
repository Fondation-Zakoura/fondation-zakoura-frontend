import "./App.css";
import NaturePartnersListPage from "./pages/naturePartner/NaturePartnersList";
import StructurePartnersListPage from "./pages/structurePartner/StructurePartnersList";
import PartnersListPage from "./pages/PartnersList";
import SitesListPage from "./pages/sites/SitesList";

import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css'



import Projects from './pages/project/Projects';
import AddProject from './pages/project/AddProject';
import ShowProject from './pages/project/ShowProject';
import EditProject from './pages/project/EditProject';
import ProjectTypesPage from './pages/project/ProjectTypesPage';
import ProjectStatusesPage from './pages/project/ProjectStatusesPage';
import LoginForm from './components/auth/LoginForm';
import ProjectBankAccountsPage from './pages/project/ProjectBankAccountsPage';
import BudgetCategoryPage from './pages/budget-category/BudgetCategoryPage';
import Collaborateurs from "./pages/collaborateurs/Collaborateurs";
import ShowCollaborateur from "./pages/collaborateurs/ShowCollaborateur";
import EditCollaborateur from "./pages/collaborateurs/EditCollaborateurModal";
import AddCollaborateurs from "./pages/collaborateurs/AddCollaborateur";
import BudgetLinePage from "./pages/budget-line/BudgetLinePage";
import { UnitsListPage } from "./pages/units/UnitsListPage";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="projects" element={<Projects />} />
        <Route path="projects/add" element={<AddProject />} />
        <Route path="projects/:id" element={<ShowProject />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route
          path="project-types"
          element={<ProjectTypesPage />}
        />
        <Route
          path="project-statuses"
          element={<ProjectStatusesPage />}
        />
        <Route
          path="/bank-accounts"
          element={<ProjectBankAccountsPage />}
        />
        <Route path="partners" element={<PartnersListPage />} />
        <Route
          path="partner-natures"
          element={<NaturePartnersListPage />}
        />
        <Route
          path="partner-structures"
          element={<StructurePartnersListPage />}
        />
        <Route
          path="/sites"
          element={<SitesListPage />}
        />
        <Route
          path="/budget-category"
          element={<BudgetCategoryPage />}
        />
        <Route
          path="/rh/collaborateurs"
          element={<Collaborateurs />}
        />
        <Route
          path="/rh/collaborateurs/:id"
          element={<ShowCollaborateur />}
        />
        <Route
          path="/rh/collaborateurs/:id/edit"
          element={<EditCollaborateur />}
        />
        <Route
          path="/rh/collaborateurs/add"
          element={<AddCollaborateurs/>}
          path="/budget-line"
          element={<BudgetLinePage />}
        />
        <Route
          path="/parametres/operations/unites"
          element={<UnitsListPage />}
        />
      </Route>
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
