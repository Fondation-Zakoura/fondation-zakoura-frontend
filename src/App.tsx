
import "./App.css";

import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';

import NaturePartnersListPage from "./pages/naturePartner/NaturePartnersList";
import StructurePartnersListPage from "./pages/structurePartner/StructurePartnersList";
import PartnersListPage from "./pages/PartnersList";
import SitesListPage from "./pages/sites/SitesList";

import CategoriesPage from './pages/categories/CategoriesPage';
import ProductTypesPage from './pages/product-types/product-types-page';
import ProductsPage from './pages/products/ProductsPage';
import ArticlesPage from './pages/articles/ArticlesPage';
import PacksPage from './pages/packs/PacksPage';

import Projects from './pages/project/Projects';
import AddProject from './pages/project/AddProject';
import ShowProject from './pages/project/ShowProject';
import EditProject from './pages/project/EditProject';
import ProjectTypesPage from './pages/project/ProjectTypesPage';
import ProjectStatusesPage from './pages/project/ProjectStatusesPage';
import ProjectBankAccountsPage from './pages/project/ProjectBankAccountsPage';

import BudgetCategoryPage from './pages/budget-category/BudgetCategoryPage';
import BudgetLinePage from "./pages/budget-line/BudgetLinePage";

import Collaborateurs from "./pages/collaborateurs/Collaborateurs";
import ShowCollaborateur from "./pages/collaborateurs/ShowCollaborateur";
import EditCollaborateur from "./pages/collaborateurs/EditCollaborateurModal";
import AddCollaborateurs from "./pages/collaborateurs/AddCollaborateur";

import { UnitsListPage } from "./pages/units/UnitsListPage";
import AddCategory from './pages/categories/AddCategory';
import ModifyCategory from './pages/categories/EditCategoryModal';
import LoginForm from './components/auth/LoginForm';


function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginForm />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Products and Catalog */}
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="produits" element={<ProductsPage />} />
        <Route path="typeproducts" element={<ProductTypesPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="packs" element={<PacksPage />} />

        {/* Projects */}
        <Route path="projects" element={<Projects />} />
        <Route path="projects/add" element={<AddProject />} />
        <Route path="projects/:id" element={<ShowProject />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route path="project-types" element={<ProjectTypesPage />} />
        <Route path="project-statuses" element={<ProjectStatusesPage />} />
        <Route path="bank-accounts" element={<ProjectBankAccountsPage />} />

        {/* Partners */}
        <Route path="partners" element={<PartnersListPage />} />
        <Route path="partner-natures" element={<NaturePartnersListPage />} />
        <Route path="partner-structures" element={<StructurePartnersListPage />} />
        <Route path="sites" element={<SitesListPage />} />

        {/* Budget */}
        <Route path="budget-category" element={<BudgetCategoryPage />} />
        <Route path="budget-line" element={<BudgetLinePage />} />

        {/* HR */}
        <Route path="rh/collaborateurs" element={<Collaborateurs />} />
        <Route path="rh/collaborateurs/add" element={<AddCollaborateurs />} />
        <Route path="rh/collaborateurs/:id" element={<ShowCollaborateur />} />
        <Route path="rh/collaborateurs/:id/edit" element={<EditCollaborateur />} />

        {/* Settings */}
        <Route path="parametres/operations/unites" element={<UnitsListPage />} />
      </Route>
    </Routes>
  );
}

export default App;
