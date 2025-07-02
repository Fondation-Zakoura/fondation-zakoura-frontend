
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


function App() {
  

  return (
    <Routes >
        <Route path='/' element={<MainLayout />} >
            <Route path='categories' element={<CategoriesPage />} />
            <Route path='projects' element={<Projects />} />
            <Route path='projects/add' element={<AddProject />} />
            <Route path='projects/:id' element={<ShowProject />} />
            <Route path='projects/:id/edit' element={<EditProject />} />
            <Route path='partenariat/partenaires' element={<PartnersList />} />

        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App
