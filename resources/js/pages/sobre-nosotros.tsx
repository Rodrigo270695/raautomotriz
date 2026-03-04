import { Head } from '@inertiajs/react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import SobreNosotrosSection from '@/components/welcome/SobreNosotrosSection';
import ScrollToTopFAB from '@/components/welcome/sections/ScrollToTopFAB';
import SoraFAB from '@/components/welcome/SoraFAB';

const BREADCRUMB_LD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio',          item: 'https://raautomotriz.com/' },
        { '@type': 'ListItem', position: 2, name: 'Sobre nosotros',  item: 'https://raautomotriz.com/sobre-nosotros' },
    ],
});

export default function SobreNosotros() {
    return (
        <>
            <Head title="Sobre nosotros - RA AUTOMOTRIZ | Taller mecánico en Chiclayo">
                <meta name="description"        content="Conoce RA AUTOMOTRIZ: misión, visión, valores y nuestro equipo. Taller mecánico en Chiclayo con más de 10 años de experiencia y 500+ clientes satisfechos." />
                <meta name="keywords"           content="sobre nosotros RA AUTOMOTRIZ, taller mecánico Chiclayo, misión visión valores, equipo mecánico Chiclayo, historia taller automotriz" />
                <meta name="author"             content="RA AUTOMOTRIZ" />
                <meta name="robots"             content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="geo.region"         content="PE-LAM" />
                <meta name="geo.placename"      content="Chiclayo, Lambayeque, Perú" />
                <link rel="canonical"           href="https://raautomotriz.com/sobre-nosotros" />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://raautomotriz.com/sobre-nosotros" />
                <meta property="og:site_name"   content="RA AUTOMOTRIZ" />
                <meta property="og:locale"      content="es_PE" />
                <meta property="og:title"       content="Sobre nosotros – RA AUTOMOTRIZ | Taller mecánico Chiclayo" />
                <meta property="og:description" content="Quiénes somos: misión, visión y valores del taller RA AUTOMOTRIZ en Chiclayo. Más de 10 años de experiencia y 500+ clientes." />
                <meta property="og:image"       content="https://raautomotriz.com/ra/dise%C3%B1o/9.jpeg" />
                <meta property="og:image:alt"   content="Equipo RA AUTOMOTRIZ – Taller mecánico Chiclayo" />
                <meta name="twitter:card"       content="summary_large_image" />
                <meta name="twitter:site"       content="@raautomotriz" />
                <meta name="twitter:title"      content="Sobre nosotros – RA AUTOMOTRIZ" />
                <meta name="twitter:description" content="Misión, visión y valores del taller mecánico de confianza en Chiclayo. +10 años, 500+ clientes." />
                <meta name="twitter:image"      content="https://raautomotriz.com/ra/dise%C3%B1o/9.jpeg" />
                <link rel="preload"             href="/ra/dise%C3%B1o/9.jpeg" as="image" type="image/jpeg" fetchPriority="high" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: BREADCRUMB_LD }} />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <main id="main-content" className="flex-1">
                    <SobreNosotrosSection />
                </main>
                <WelcomeFooter />
            </div>
            <SoraFAB />
            <ScrollToTopFAB />
        </>
    );
}
