import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface ScrollRevealBlockProps {
    children: (isVisible: boolean) => ReactNode;
    className?: string;
    as?: 'div' | 'section' | 'article';
    threshold?: number;
    rootMargin?: string;
}

export default function ScrollRevealBlock({
    children,
    className = '',
    as: Tag = 'div',
    threshold = 0.08,
    rootMargin = '0px 0px -5% 0px',
}: ScrollRevealBlockProps) {
    const { ref, isVisible } = useScrollReveal({ threshold, rootMargin });

    return (
        <Tag ref={ref as React.RefObject<HTMLElement>} className={className}>
            {children(isVisible)}
        </Tag>
    );
}

export const revealClasses = {
    base: 'transition-all duration-700 ease-out',
    hidden: 'translate-y-8 opacity-0',
    visible: 'translate-y-0 opacity-100',
};
