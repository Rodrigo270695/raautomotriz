import { useRef, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, Send, CheckCircle } from 'lucide-react';

const MESSAGES = [
    { from: 'user', text: 'Mi carro hace un ruido raro al frenar, ¿qué puede ser?' },
    { from: 'sora', text: 'Hola, soy SORA 👋. Ese ruido puede indicar pastillas desgastadas, discos rayados o un problema en los cilindros. ¿El ruido es metálico o un chirrido?' },
    { from: 'user', text: 'Es un chirrido fuerte cuando presiono el pedal.' },
    { from: 'sora', text: 'Entendido. El chirrido suele ser señal de pastillas al límite. Te recomiendo venir al taller. ¿Te ayudo a prepara tu visita?' },
];

function ChatMockup() {
    const ref     = useRef<HTMLDivElement>(null);
    const inView  = useInView(ref, { once: true });
    const [vis, setVis] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const t = setInterval(() => setVis((v) => v >= MESSAGES.length ? v : v + 1), 900);
        return () => clearInterval(t);
    }, [inView]);

    return (
        <div ref={ref} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/8 px-5 py-3.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#D9252A]">
                    <Bot className="size-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">SORA</p>
                    <p className="text-xs text-white/50">Asistente automotriz IA</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En línea
                </span>
            </div>

            {/* Messages */}
            <div className="flex min-h-[260px] flex-col gap-3 px-5 py-5">
                <AnimatePresence>
                    {MESSAGES.slice(0, vis).map((msg, i) => (
                        <motion.div
                            key={i}
                            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                msg.from === 'user'
                                    ? 'rounded-br-sm bg-[#D9252A] text-white'
                                    : 'rounded-bl-sm bg-white/15 text-white/90'
                            }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
                <div className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-xs text-white/35 select-none">
                    Escribe tu consulta…
                </div>
                <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#D9252A] hover:opacity-80" aria-label="Enviar" tabIndex={-1}>
                    <Send className="size-3.5 text-white" />
                </button>
            </div>
        </div>
    );
}

export default function SoraSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section
            id="sora"
            className="relative overflow-hidden bg-linear-to-br from-[#0d1929] via-[#1E2D4A] to-[#0d1929] py-24"
            aria-label="SORA - Asistente de IA"
        >
            <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[#D9252A]/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-[#1E2D4A]/40 blur-3xl" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, x: -32 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D9252A]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                            <Bot className="size-3.5" /> Inteligencia artificial
                        </span>
                        <h2 className="mb-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                            Conversa con <span className="text-[#D9252A]">SORA</span>,<br />
                            tu asistente automotriz
                        </h2>
                        <p className="mb-8 text-base leading-relaxed text-white/65">
                            ¿Tienes una falla? SORA analiza los síntomas con IA y orienta tu visita al taller.
                            El técnico ya tendrá contexto cuando llegues.
                        </p>
                        <ul className="mb-10 space-y-3">
                            {[
                                'Diagnóstico previo basado en síntomas',
                                'Orientación 24/7 sin esperar turnos',
                                'El técnico recibe el historial del chat',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                                    <CheckCircle className="size-4 shrink-0 text-[#D9252A]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#D9252A] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/25 transition-all hover:bg-[#c21f24] hover:-translate-y-0.5"
                        >
                            <MessageCircle className="size-4" /> Hablar con SORA
                        </Link>
                    </motion.div>

                    <motion.div
                        className="mx-auto w-full max-w-md"
                        initial={{ opacity: 0, x: 32 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <ChatMockup />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
