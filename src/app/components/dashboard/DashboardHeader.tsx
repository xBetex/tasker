import React from 'react';

interface DashboardHeaderProps {
  darkMode: boolean;
}

export default function DashboardHeader({ darkMode }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Task Dashboard</h1>
    </div>
  );
} 