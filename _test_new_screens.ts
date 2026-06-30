// Test imports pour les nouveaux écrans
import '@/app/(explore)/events';
import '@/app/(explore)/experiences';
import '@/app/(events)/[id]';
import '@/app/(experiences)/[id]';
import '@/app/(places)/[id]';

// Test imports pour les composants
import '@/components/events/EventCard';
import '@/components/experiences/ExperienceCard';
import '@/components/ui/FilterButton';
import '@/components/ui/InfoItem';

// Test imports pour les types et data
import '@/features/events/types';
import '@/features/events/mockData';
import '@/features/experiences/types';
import '@/features/experiences/mockData';
import '@/features/places/mockData';

console.log('✅ Tous les imports fonctionnent correctement !');
