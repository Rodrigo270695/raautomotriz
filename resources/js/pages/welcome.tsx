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
import ScrollToTopFAB     from '@/components/welcome/sections/ScrollToTopFAB';
import SoraFAB            from '@/components/welcome/SoraFAB';
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
    image: 'https://raautomotriz.com/ra/dise%C3%B1o/1.jpeg',
    telephone: CONTACT.phone ?? '+51 999 999 999',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'El Ayllu 267',
        addressLocality: 'La Victoria',
        addressRegion: 'Lambayeque',
        postalCode: '14001',
        addressCountry: 'PE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CONTACT.coordinates.lat, longitude: CONTACT.coordinates.lng },
    hasMap: CONTACT.googleMapsUrl,
    areaServed: { '@type': 'City', name: 'Chiclayo' },
    openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '08:00', closes: '18:00' },
    ],
    priceRange: '$$',
    currenciesAccepted: 'PEN',
    paymentAccepted: 'Cash, Credit Card, Yape, Plin',
    sameAs: [
        'https://facebook.com/raautomotriz',
        'https://instagram.com/raautomotriz',
        'https://tiktok.com/@raautomotriz',
    ],
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '47',
        bestRating: '5',
        worstRating: '1',
    },
    review: [
        { '@type': 'Review', author: { '@type': 'Person', name: 'Carlos Mendoza' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Excelente servicio, repararon el motor de mi camioneta en tiempo récord. 100% recomendados.' },
        { '@type': 'Review', author: { '@type': 'Person', name: 'María Torres' }, reviewRating: { '@type': 'Rating', ratingValue: '5' }, reviewBody: 'Muy profesionales. El diagnóstico fue exacto y el presupuesto justo.' },
    ],
});

export default function Welcome({ activePromotion }: { activePromotion?: ActivePromotion | null }) {
    return (
        <>
            <Head title="RA AUTOMOTRIZ - Taller mecánico en Chiclayo | Reparación y mantenimiento">
                <meta name="description"        content="RA AUTOMOTRIZ: taller mecánico especializado en Chiclayo. Reparación de motores, frenos, suspensión, sistema eléctrico, scanner OBD2, planchado y pintura. Calidad, garantía y confianza." />
                <meta name="keywords"           content="taller mecánico Chiclayo, reparación de autos Chiclayo, mecánica automotriz Chiclayo, scanner automotriz, cambio de aceite Chiclayo, frenos Chiclayo, planchado pintura Chiclayo" />
                <meta name="author"             content="RA AUTOMOTRIZ" />
                <meta name="robots"             content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="geo.region"         content="PE-LAM" />
                <meta name="geo.placename"      content="Chiclayo, Lambayeque, Perú" />
                <meta name="geo.position"       content={`${CONTACT.coordinates.lat};${CONTACT.coordinates.lng}`} />
                <meta name="ICBM"               content={`${CONTACT.coordinates.lat}, ${CONTACT.coordinates.lng}`} />
                <link rel="canonical"           href="https://raautomotriz.com/" />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://raautomotriz.com/" />
                <meta property="og:site_name"   content="RA AUTOMOTRIZ" />
                <meta property="og:locale"      content="es_PE" />
                <meta property="og:title"       content="RA AUTOMOTRIZ – Taller mecánico en Chiclayo" />
                <meta property="og:description" content="Taller mecánico especializado en Chiclayo. Motor, frenos, suspensión, scanner OBD2, planchado y pintura. Más de 500 clientes satisfechos." />
                <meta property="og:image"       content="https://raautomotriz.com/ra/dise%C3%B1o/1.jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:alt"   content="Taller RA AUTOMOTRIZ – Chiclayo" />
                <meta name="twitter:card"       content="summary_large_image" />
                <meta name="twitter:site"       content="@raautomotriz" />
                <meta name="twitter:title"      content="RA AUTOMOTRIZ – Taller mecánico en Chiclayo" />
                <meta name="twitter:description" content="Motor, frenos, suspensión, scanner OBD2 y más. El taller de confianza en Chiclayo." />
                <meta name="twitter:image"      content="https://raautomotriz.com/ra/dise%C3%B1o/1.jpeg" />
                <link rel="preload"             href="/ra/dise%C3%B1o/1.jpeg" as="image" type="image/jpeg" fetchPriority="high" />
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

            <SoraFAB />
            <WhatsAppFAB />
            <ScrollToTopFAB />
            {activePromotion && <PromotionModal promotion={activePromotion} />}
        </>
    );
}
