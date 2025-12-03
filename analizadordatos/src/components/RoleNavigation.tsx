'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Tabs, Tab } from '@mui/material';
import { Shield, BookOpen, Users, User } from 'lucide-react';

interface RoleNavigationProps {
  currentRole: 'admin' | 'docente' | 'padre' | 'alumno';
  studentId: string;
}

export default function RoleNavigation({ currentRole, studentId }: RoleNavigationProps) {
  const router = useRouter();

  const roles = [
    { key: 'admin', label: 'Admin', icon: Shield, color: '#dc2626' },
    { key: 'docente', label: 'Docente', icon: BookOpen, color: '#2563eb' },
    { key: 'padre', label: 'Padre', icon: Users, color: '#7c3aed' },
    { key: 'alumno', label: 'Alumno', icon: User, color: '#059669' },
  ];

  const handleNavigation = (role: string) => {
    router.push(`/dashboard/view?role=${role}&id=${studentId}`);
  };

  const currentIndex = roles.findIndex(r => r.key === currentRole);
  const currentRoleData = roles[currentIndex];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 2,
        p: 2,
        mb: 3,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      <Tabs
        value={currentIndex}
        onChange={(event, newValue) => {
          handleNavigation(roles[newValue].key);
        }}
        variant="fullWidth"
        sx={{
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: currentRoleData?.color || '#1976d2',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '12px 16px',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#1e293b',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '&.Mui-selected': {
              color: currentRoleData?.color || '#1976d2',
              fontWeight: 600,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          },
        }}
      >
        {roles.map(({ key, label, icon: Icon, color }) => (
          <Tab
            key={key}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon 
                  size={20} 
                  style={{
                    transition: 'all 0.3s ease',
                    color: currentRole === key ? color : 'inherit',
                  }}
                />
                <span>Vista {label}</span>
              </Box>
            }
            icon={undefined}
            sx={{
              '&.Mui-selected': {
                '& svg': {
                  filter: `drop-shadow(0 0 4px ${color}40)`,
                },
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
