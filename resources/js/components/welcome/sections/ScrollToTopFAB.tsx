import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopFAB() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 500);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    aria-label="Volver arriba"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-24 right-5 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#1E2D4A]/15 bg-white text-[#1E2D4A] shadow-lg transition-colors hover:bg-[#1E2D4A] hover:text-white dark:border-white/15 dark:bg-[#0d1929] dark:text-white dark:hover:bg-white dark:hover:text-[#0d1929]"
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                >
                    <ArrowUp className="size-4" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
