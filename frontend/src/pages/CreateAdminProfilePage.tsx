import React from 'react';
import { AdminProfileForm } from '@/components/AdminProfileForm';
import { useNavigate } from 'react-router-dom';

const CreateAdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <AdminProfileForm onComplete={() => navigate('/dashboard')} />
    </div>
  );
};

export default CreateAdminProfilePage;
