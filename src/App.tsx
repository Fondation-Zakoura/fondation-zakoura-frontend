
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css'

import CategoriesPage from './pages/categories/CategoriesPage';
import AddCategory from './pages/categories/AddCategory';
import ModifyCategory from './pages/categories/EditCategoryModal';
import LoginForm from './components/auth/LoginForm';


function App() {
  

  return (
    <Routes >
        <Route path='/' element={<MainLayout />} >
            <Route path='categories' element={<CategoriesPage />} />
            
        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App
