import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Letra "A" que baja con el scroll (más lento que la R para dar profundidad).
 */
export default function ScrollLetterA() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0.1, 0.45, 0.8], [0, 100, 280]);

    return (
        <motion.span
            aria-hidden
            className="pointer-events-none fixed left-1/2 top-[22%] z-0 -translate-x-1/2 select-none"
            className="text-[#D9252A]/5 dark:text-[#f87171]/10"
            style={{
                y,
                fontSize: 'clamp(5rem, 18vw, 14rem)',
                lineHeight: 0.85,
                fontFamily: 'inherit',
                fontWeight: 800,
                fontStyle: 'italic',
            }}
        >
            A
        </motion.span>
    );
}
