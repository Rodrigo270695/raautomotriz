import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppFAB() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.a
                    href="https://wa.me/51999999999?text=Hola%20RA%20AUTOMOTRIZ%2C%20necesito%20informaci%C3%B3n%20sobre%20sus%20servicios"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contactar por WhatsApp"
                    className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-[#25d366]/30 transition-transform hover:scale-110"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                >
                    <svg viewBox="0 0 32 32" className="size-7 fill-white" aria-hidden>
                        <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.66 4.86 1.9 6.97L2 30l7.27-1.88A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.32-.59-6.18-1.71l-.44-.26-4.58 1.18 1.21-4.46-.29-.46A11.47 11.47 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.29-8.59c-.34-.17-2.03-1-2.35-1.12-.31-.11-.54-.17-.77.17-.23.34-.88 1.12-1.08 1.35-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.75-1.7-1.02-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.05-2.55-.28-.67-.56-.58-.77-.59h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.03-.83 2.32-1.63.29-.8.29-1.49.2-1.63-.09-.14-.31-.23-.66-.4z"/>
                    </svg>
                </motion.a>
            )}
        </AnimatePresence>
    );
}
