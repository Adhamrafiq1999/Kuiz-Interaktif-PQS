import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import StudentRegisterForm from './components/StudentRegisterForm.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<StudentRegisterForm onBackToApp={() => window.location.href = '/'} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
