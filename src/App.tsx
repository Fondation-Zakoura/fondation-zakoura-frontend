
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css'
import PartnersList from './pages/PartnersList';

import CategoriesPage from './pages/categories/CategoriesPage';
import AddCategory from './pages/categories/AddCategory';
import ModifyCategory from './pages/categories/EditCategoryModal';
import LoginForm from './components/auth/LoginForm';
import Projects from './pages/project/Projects';
import AddProject from './pages/project/AddProject';
import ShowProject from './pages/project/ShowProject';
import EditProject from './pages/project/EditProject';

import CategoriesPage from './pages/categories/CategoriesPage';
import AddCategory from './pages/categories/AddCategory';
import ModifyCategory from './pages/categories/EditCategoryModal';
import LoginForm from './components/auth/LoginForm';
import Projects from './pages/project/Projects';
import AddProject from './pages/project/AddProject';
import ShowProject from './pages/project/ShowProject';
import EditProject from './pages/project/EditProject';
import NaturePartnersListPage from './pages/naturePartner/NaturePartnersList';
import StructurePartnersListPage from './pages/structurePartner/StructurePartnersList';


function App() {
  

  return (
    <Routes >
        <Route path='/' element={<MainLayout />} >
            <Route path='categories' element={<CategoriesPage />} />
            <Route path='/projets/projets/projets' element={<Projects />} />
            <Route path='projects/add' element={<AddProject />} />
            <Route path='projects/:id' element={<ShowProject />} />
            <Route path='projects/:id/edit' element={<EditProject />} />
<<<<<<< HEAD
<<<<<<< HEAD
            <Route path='partenariat/partenaires' element={<PartnersList />} />

=======
            <Route path='project-types' element={<ProjectTypesPage />} />
            <Route path='project-statuses' element={<ProjectStatusesPage />} />
            <Route path='project-bank-accounts' element={<ProjectBankAccountsPage />} />
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
=======
            <Route path='/partenariat/partenaires' element={<PartnersList />} />
            <Route path="/parametres/finance/types/natures-partenaires" element={<NaturePartnersListPage />} />
            <Route path="/structure-partners" element={<StructurePartnersListPage />} />
>>>>>>> 093bc3a (updating the filter to use RTK query)
        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App
