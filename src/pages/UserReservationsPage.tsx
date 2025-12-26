import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import UserReservations from '@/components/user/UserReservations';

export default function UserReservationsPage() {
  return (
    <UniversalLayout>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <UserReservations />
      </main>
    </UniversalLayout>
  );
}
