import { Head } from '@inertiajs/react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import SobreNosotrosSection from '@/components/welcome/SobreNosotrosSection';

export default function SobreNosotros() {
    return (
        <>
            <Head title="Sobre nosotros - RA AUTOMOTRIZ">
                <meta
                    name="description"
                    content="Misión, visión y valores de RA AUTOMOTRIZ. Taller mecánico especializado con compromiso de calidad y trato cercano."
                />
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
