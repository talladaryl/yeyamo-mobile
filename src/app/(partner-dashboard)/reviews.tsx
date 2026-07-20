import { useMemo, useState } from 'react';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { ReviewCard } from '@/components/partner-dashboard/ReviewCard';
import { customerReviews } from '@/features/partner-dashboard/mockData';

const FILTERS = ['Tous (3)', 'À répondre', '5 étoiles', '4 étoiles'] as const;
export default function ReviewsScreen() {
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  const data = useMemo(() => filter.includes('5') ? customerReviews.filter((item) => item.rating === 5) : filter.includes('4') ? customerReviews.filter((item) => item.rating === 4) : customerReviews, [filter]);
  return (
    <PartnerPage title="Avis clients" subtitle="Consultez les avis et répondez à vos clients">
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {data.map((item) => <ReviewCard key={item.id} review={item} onReply={() => {}} />)}
    </PartnerPage>
  );
}
