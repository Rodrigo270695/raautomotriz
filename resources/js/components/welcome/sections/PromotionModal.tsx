import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Promotion {
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
}

export default function PromotionModal({ promotion }: { promotion: Promotion }) {
    const [open, setOpen] = useState(true);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-200 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal
                    aria-label={promotion.title}
                >
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-hidden
                    />
                    <motion.div
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0d1929]"
                        initial={{ scale: 0.9, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar"
                            className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40"
                        >
                            <X className="size-4" />
                        </button>
                        {promotion.image_path && (
                            <img
                                src={`/storage/${promotion.image_path}`}
                                alt={promotion.title}
                                className="w-full max-h-64 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <h2 className="mb-2 text-xl font-extrabold text-[#1E2D4A] dark:text-white">{promotion.title}</h2>
                            {promotion.description && (
                                <p className="text-sm text-[#1E2D4A]/65 dark:text-white/55">{promotion.description}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="mt-5 w-full rounded-xl bg-[#D9252A] py-3 text-sm font-bold text-white hover:bg-[#c21f24]"
                            >
                                Ver oferta
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
