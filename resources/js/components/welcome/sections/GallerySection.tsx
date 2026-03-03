import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Selección curada de 8 fotos del taller
const PICKS = [3, 5, 7, 10, 14, 17, 20, 22];

export default function GallerySection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="overflow-hidden bg-[#1E2D4A] py-16" aria-label="Galería del taller">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    className="mb-10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Nuestro taller
                    </span>
                    <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                        Instalaciones de primera categoría
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {PICKS.map((n, i) => (
                        <motion.div
                            key={n}
                            className={`overflow-hidden rounded-xl ${i === 0 || i === 4 ? 'col-span-2 row-span-2' : 'col-span-1'}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.06 * i }}
                        >
                            <img
                                src={`/ra/dise%C3%B1o/${n}.jpeg`}
                                alt={`RA AUTOMOTRIZ taller - imagen ${n}`}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                style={{ minHeight: i === 0 || i === 4 ? '220px' : '110px' }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
