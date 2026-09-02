import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { demoProverbs, proverbCategories } from '@/features/culture/culturalCatalog.demo';
export default function ProverbsScreen() { return <CatalogListScreen title="Proverbes" subtitle="100 paroles classées par thème et région" categories={proverbCategories} detailBase="/(explore)/proverbs" items={demoProverbs.map((item) => ({ id: item.id, title: item.text, subtitle: `${item.region} · ${item.language.toUpperCase()}`, category: item.category, imageUrl: item.imageUrl }))} />; }
