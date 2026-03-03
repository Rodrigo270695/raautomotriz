import { Head } from '@inertiajs/react';
import WelcomeNavbar      from '@/components/welcome/WelcomeNavbar';
import WelcomeHero        from '@/components/welcome/WelcomeHero';
import WelcomeFooter      from '@/components/welcome/WelcomeFooter';
import StatsBar           from '@/components/welcome/sections/StatsBar';
import ServicesSection    from '@/components/welcome/sections/ServicesSection';
import GallerySection     from '@/components/welcome/sections/GallerySection';
import SoraSection        from '@/components/welcome/sections/SoraSection';
import WhyUsSection       from '@/components/welcome/sections/WhyUsSection';
import TestimonialsSection from '@/components/welcome/sections/TestimonialsSection';
import CtaSection         from '@/components/welcome/sections/CtaSection';
import WhatsAppFAB        from '@/components/welcome/sections/WhatsAppFAB';
import PromotionModal     from '@/components/welcome/sections/PromotionModal';
import { CONTACT }        from '@/data/contact';

interface ActivePromotion {
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
}

const SCHEMA_LD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'RA AUTOMOTRIZ',
    description: 'Taller mecánico especializado en Chiclayo. Reparación de motores, frenos, suspensión, dirección, sistema eléctrico, scanner OBD2, planchado y pintura.',
    url: 'https://raautomotriz.com',
    logo: 'https://raautomotriz.com/logorasf.png',
    image: 'https://raautomotriz.com/logorasf.png',
    address: { '@type': 'PostalAddress', streetAddress: 'El Ayllu 267', addressLocality: 'La Victoria', addressRegion: 'Lambayeque', addressCountry: 'PE' },
    geo: { '@type': 'GeoCoordinates', latitude: CONTACT.coordinates.lat, longitude: CONTACT.coordinates.lng },
    hasMap: CONTACT.googleMapsUrl,
    areaServed: { '@type': 'City', name: 'Chiclayo' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '08:00', closes: '18:00' }],
    priceRange: '$$',
});

export default function Welcome({ activePromotion }: { activePromotion?: ActivePromotion | null }) {
    return (
        <>
            <Head title="RA AUTOMOTRIZ - Taller mecánico en Chiclayo | Reparación y mantenimiento">
                <meta name="description"        content="RA AUTOMOTRIZ: taller mecánico especializado en Chiclayo. Reparación de motores, frenos, suspensión, sistema eléctrico, scanner OBD2, planchado y pintura. Calidad, garantía y confianza." />
                <meta name="keywords"           content="taller mecánico Chiclayo, reparación de autos Chiclayo, mecánica automotriz Chiclayo, scanner automotriz, cambio de aceite Chiclayo" />
                <meta name="robots"             content="index, follow" />
                <link rel="canonical"           href="https://raautomotriz.com/" />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://raautomotriz.com/" />
                <meta property="og:title"       content="RA AUTOMOTRIZ – Taller mecánico en Chiclayo" />
                <meta property="og:description" content="Servicio automotriz profesional en Chiclayo: motor, frenos, suspensión, scanner y más." />
                <meta property="og:image"       content="https://raautomotriz.com/logorasf.png" />
                <meta name="twitter:card"       content="summary_large_image" />
                <meta name="twitter:title"      content="RA AUTOMOTRIZ – Taller mecánico en Chiclayo" />
                <meta name="twitter:image"      content="https://raautomotriz.com/logorasf.png" />
                <link rel="preconnect"          href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA_LD }} />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <main id="main-content">
                    <WelcomeHero />
                    <StatsBar />
                    <ServicesSection />
                    <GallerySection />
                    <SoraSection />
                    <WhyUsSection />
                    <TestimonialsSection />
                    <CtaSection />
                </main>
                <WelcomeFooter />
            </div>

            <WhatsAppFAB />
            {activePromotion && <PromotionModal promotion={activePromotion} />}
        </>
    );
}
