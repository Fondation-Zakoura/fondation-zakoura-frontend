
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


function App() {
  

  return (
    <Routes >
        <Route path='/' element={<MainLayout />} >
            <Route path='projects' element={<Projects />} />
            <Route path='projects/add' element={<AddProject />} />
            <Route path='projects/:id' element={<ShowProject />} />
            <Route path='projects/:id/edit' element={<EditProject />} />
            <Route path='/settings/finance/types/projects' element={<ProjectTypesPage />} />
            <Route path='/settings/finance/statuses/projects' element={<ProjectStatusesPage />} />
            <Route path='bank-accounts' element={<ProjectBankAccountsPage />} />
            {/* <Route path='partners' element={<PartnersList />} /> */}
        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App