import { Head } from '@inertiajs/react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import SobreNosotrosSection from '@/components/welcome/SobreNosotrosSection';

export default function SobreNosotros() {
    return (
        <>
            <Head title="Sobre nosotros - RA AUTOMOTRIZ | Taller mecánico en Chiclayo">
                <meta name="description"  content="Conoce RA AUTOMOTRIZ: misión, visión, valores y nuestro equipo. Taller mecánico en Chiclayo con más de 10 años de experiencia y 500+ clientes satisfechos." />
                <meta name="robots"       content="index, follow" />
                <link rel="canonical"     href="https://raautomotriz.com/sobre-nosotros" />
                <meta property="og:title" content="Sobre nosotros – RA AUTOMOTRIZ" />
                <meta property="og:description" content="Quiénes somos: misión, visión y valores del taller RA AUTOMOTRIZ en Chiclayo." />
                <meta property="og:image" content="https://raautomotriz.com/logorasf.png" />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <main className="flex-1">
                    <SobreNosotrosSection />
                </main>
                <WelcomeFooter />
            </div>
        </>
    );
}
