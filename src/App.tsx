import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import "./App.css";
import CategoriesPage from "./pages/categories/CategoriesPage";
import AddCategory from "./pages/categories/AddCategory";
import ModifyCategory from "./pages/categories/EditCategoryModal";
import LoginForm from "./components/auth/LoginForm";
import Projects from "./pages/project/Projects";
import AddProject from "./pages/project/AddProject";
import ShowProject from "./pages/project/ShowProject";
import EditProject from "./pages/project/EditProject";
import ProjectTypesPage from "./pages/project/ProjectTypesPage";
import ProjectStatusesPage from "./pages/project/ProjectStatusesPage";
import ProjectBankAccountsPage from "./pages/project/ProjectBankAccountsPage";
import NaturePartnersListPage from "./pages/naturePartner/NaturePartnersList";
import StructurePartnersListPage from "./pages/structurePartner/StructurePartnersList";
import PartnersListPage from "./pages/PartnersList";
import SitesListPage from "./pages/sites/SitesList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/add" element={<AddProject />} />
        <Route path="projects/:id" element={<ShowProject />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route
          path="settings/finance/types/projects"
          element={<ProjectTypesPage />}
        />
        <Route
          path="settings/finance/statuses/projects"
          element={<ProjectStatusesPage />}
        />
        <Route
          path="settings/projects/bank-accounts"
          element={<ProjectBankAccountsPage />}
        />
        <Route path="partenariat/partenaires" element={<PartnersListPage />} />
        <Route
          path="parametres/finance/types/natures-partenaires"
          element={<NaturePartnersListPage />}
        />
        <Route
          path="parametres/finance/types/structures-partenaires"
          element={<StructurePartnersListPage />}
        />
        <Route
          path="/parametres/operations/sites"
          element={<SitesListPage />}
        />
      </Route>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
