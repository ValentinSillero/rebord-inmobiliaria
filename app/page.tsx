import { About } from '@/components/About';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function HomePage() { return <><Header /><main><Hero /><FeaturedProperties /><Stats /><About /></main><Footer /><WhatsAppButton /></>; }
