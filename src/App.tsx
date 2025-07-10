
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css'



import CategoriesPage from './pages/categories/CategoriesPage';
import LoginForm from './components/auth/LoginForm';
import Projects from './pages/project/Projects';
import AddProject from './pages/project/AddProject';
import ShowProject from './pages/project/ShowProject';
import EditProject from './pages/project/EditProject';
import ProjectTypesPage from './pages/project/ProjectTypesPage';
import ProjectStatusesPage from './pages/project/ProjectStatusesPage';
import ProjectBankAccountsPage from './pages/project/ProjectBankAccountsPage';
import Collaborateurs from './pages/collaborateurs/Collaborateurs';
import AddCollaborateurs from './pages/collaborateurs/AddCollaborateur';
import EditColaborateur from './pages/collaborateurs/EditCollaborateurModal';
import ShowCollaborateur from './pages/collaborateurs/ShowCollaborateur';


function App() {
  

  return (
    <Routes >
        <Route path='/' element={<MainLayout />} >
            <Route path='categories' element={<CategoriesPage />} />
            <Route path='projects' element={<Projects />} />
            <Route path='projects/add' element={<AddProject />} />
            <Route path='projects/:id' element={<ShowProject />} />
            <Route path='projects/:id/edit' element={<EditProject />} />
            <Route path='/settings/finance/types/projects' element={<ProjectTypesPage />} />
            <Route path='/settings/finance/statuses/projects' element={<ProjectStatusesPage />} />
            <Route path='/settings/projects/bank-accounts' element={<ProjectBankAccountsPage />} />
            <Route path='/rh/collaborateurs' element={<Collaborateurs/> } />
            <Route path='/rh/collaborateurs/add' element={<AddCollaborateurs />} />
            <Route path='/rh/collaborateurs/:id/edit' element={<EditColaborateur />} />
            <Route path='/rh/collaborateurs/:id' element={<ShowCollaborateur />} />

        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App
