import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
    /** Porcentaje visible (0-1) para considerar "en vista" */
    threshold?: number;
    /** Margen negativo para disparar un poco antes de entrar */
    rootMargin?: string;
    /** Disparar solo una vez (no revertir al salir) */
    once?: boolean;
}

/**
 * Hook para revelar elementos al hacer scroll.
 * Devuelve ref y si el elemento está visible para aplicar clases de animación.
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
    const {
        threshold = 0.12,
        rootMargin = '0px 0px -8% 0px',
        once = true,
    } = options;

    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) return;
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return { ref, isVisible };
}
