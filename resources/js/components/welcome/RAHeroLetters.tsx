import { motion } from 'framer-motion';

const spring = { type: 'spring' as const, stiffness: 80, damping: 18 };
const springSlow = { type: 'spring' as const, stiffness: 50, damping: 20 };

export default function RAHeroLetters() {
    return (
        <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-28 lg:py-36">
            <div className="relative flex items-baseline justify-center gap-0">
                {/* R — desliza desde la izquierda */}
                <motion.span
                    className="inline-block font-extrabold italic tracking-tight text-[#D9252A]"
                    style={{
                        fontSize: 'clamp(4rem, 15vw, 10rem)',
                        lineHeight: 0.9,
                        textShadow: '0 2px 20px rgba(217,37,42,0.25), 0 0 40px rgba(217,37,42,0.08)',
                    }}
                    initial={{ x: -160, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ ...spring, delay: 0.15 }}
                >
                    R
                </motion.span>
                {/* A — desliza desde la derecha */}
                <motion.span
                    className="inline-block font-extrabold italic tracking-tight text-[#D9252A]"
                    style={{
                        fontSize: 'clamp(4rem, 15vw, 10rem)',
                        lineHeight: 0.9,
                        textShadow: '0 2px 20px rgba(217,37,42,0.25), 0 0 40px rgba(217,37,42,0.08)',
                    }}
                    initial={{ x: 160, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ ...spring, delay: 0.25 }}
                >
                    A
                </motion.span>
            </div>

            {/* AUTOMOTRIZ — aparece después con fluidez */}
            <motion.span
                className="mt-2 block text-sm font-bold uppercase tracking-[0.35em] text-[#1E2D4A]/90 dark:text-white/90 md:text-base"
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...springSlow, delay: 0.55 }}
            >
                Automotriz
            </motion.span>

            <motion.p
                className="mt-8 max-w-xl text-center text-base leading-relaxed text-[#1E2D4A]/80 dark:text-white/75 md:mt-10 md:text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...springSlow, delay: 0.75 }}
            >
                Conoce a quienes cuidan tu vehículo
            </motion.p>
        </div>
    );
}
