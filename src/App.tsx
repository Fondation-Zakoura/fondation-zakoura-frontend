
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css'

import CategoriesPage from './pages/categories/CategoriesPage';
import ProductTypesPage from './pages/product-types/product-types-page';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsPage from './pages/products/ProductsPage';


function App() {
  

  return (
    <Routes >
        <Route
    path="/"
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  >
            <Route path='categories' element={<CategoriesPage />} />
            <Route path='produits' element={<ProductsPage  />} />
             <Route path='typeproducts' element={<ProductTypesPage  />} />
            
        </Route>
        <Route path='/login' element={<LoginForm />} />
    </Routes>
  )
}

export default App
