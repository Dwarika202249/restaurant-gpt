import React from 'react';
import { AdminProfileForm } from '@/components/AdminProfileForm';
import { useNavigate } from 'react-router-dom';
import { useTabTitle } from '@/hooks';

const CreateAdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  useTabTitle('Profile Setup');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <AdminProfileForm onComplete={() => navigate('/dashboard')} />
    </div>
  );
};

export default CreateAdminProfilePage;
