import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot } from 'lucide-react';

/** Enfoca el textarea cuando loading pasa de true a false (tras enviar mensaje). */
function useFocusInputAfterSend(loading: boolean, open: boolean) {
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const wasLoading = useRef(false);

    useEffect(() => {
        if (wasLoading.current && !loading && open) {
            requestAnimationFrame(() => inputRef.current?.focus());
        }
        wasLoading.current = loading;
    }, [loading, open]);

    return inputRef;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    /** ISO 8601, ej. 2026-03-03T18:20:00.000Z */
    createdAt?: string;
}

interface Props {
    open: boolean;
    messages: ChatMessage[];
    loading: boolean;
    input: string;
    onInputChange: (val: string) => void;
    onSend: () => void;
    onClose: () => void;
    showRegisterPrompt?: boolean;
    /** true si se restauraron mensajes del día anterior al abrir */
    restored?: boolean;
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-1 py-0.5">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="block size-1.5 rounded-full bg-white/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    );
}

function formatTime(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export default function SoraChatPanel({ open, messages, loading, input, onInputChange, onSend, onClose, showRegisterPrompt, restored }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useFocusInputAfterSend(loading, open);

    // Siempre mantener el scroll al último mensaje cuando hay cambios o se reabre el panel
    useEffect(() => {
        if (!open) return;
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [open, messages.length, loading]);

function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
            e.preventDefault();
            onSend();
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-label="Chat con SORA — asistente RA AUTOMOTRIZ"
                    aria-modal="true"
                    className="fixed bottom-24 left-4 z-50 flex w-[340px] flex-col overflow-hidden rounded-3xl shadow-2xl sm:w-[380px]"
                    style={{ maxHeight: 'calc(100vh - 120px)' }}
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                    {/* ── Header ── */}
                    <div className="flex items-center gap-3 bg-[#1E2D4A] px-4 py-3.5">
                        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#D9252A]/20">
                            <Bot className="size-5 text-[#D9252A]" />
                            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#1E2D4A] bg-[#25d366]" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold leading-none text-white">SORA</p>
                            <p className="mt-0.5 text-xs text-white/50">Asistente RA AUTOMOTRIZ · En línea</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Cerrar chat"
                            onClick={onClose}
                            className="flex size-8 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* ── Messages ── */}
                    <div
                        ref={containerRef}
                        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#0d1929] px-4 py-4"
                        style={{ minHeight: '280px', maxHeight: '380px' }}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className="flex flex-col gap-0">
                                {/* Separador "conversación de hoy" tras el saludo inicial */}
                                {restored && i === 1 && (
                                    <div className="mb-2 flex items-center gap-2 px-1">
                                        <div className="h-px flex-1 bg-white/10" />
                                        <span className="text-[9px] uppercase tracking-widest text-white/30">conversación de hoy</span>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                )}
                                <motion.div
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                {msg.role === 'assistant' && (
                                    <div className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#D9252A]/20">
                                        <Bot className="size-3.5 text-[#D9252A]" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'rounded-br-sm bg-[#D9252A] text-white'
                                            : 'rounded-bl-sm bg-white/8 text-white/90'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap wrap-break-word">
                                        {msg.content}
                                    </p>
                                    {msg.createdAt && (
                                        <span className="mt-1 block text-[10px] text-white/50">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    )}
                                </div>
                                </motion.div>
                            </div>
                        ))}

                        {loading && (
                            <motion.div
                                className="flex justify-start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#D9252A]/20">
                                    <Bot className="size-3.5 text-[#D9252A]" />
                                </div>
                                <div className="rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5">
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Register prompt banner ── */}
                    <AnimatePresence>
                        {showRegisterPrompt && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-[#1E2D4A] px-4 py-2.5"
                            >
                                <p className="text-xs leading-relaxed text-white/80">
                                    💡 <span className="font-semibold text-white">¿Sabías que?</span> Si te{' '}
                                    <a
                                        href="/register"
                                        className="font-semibold text-[#D9252A] underline underline-offset-2 hover:text-[#ff4a4f]"
                                    >
                                        registras
                                    </a>{' '}
                                    o{' '}
                                    <a
                                        href="/login"
                                        className="font-semibold text-[#D9252A] underline underline-offset-2 hover:text-[#ff4a4f]"
                                    >
                                        inicias sesión
                                    </a>
                                    , guardamos esta conversación para que nuestros técnicos ya tengan contexto de tu caso cuando llegues al taller.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Input ── */}
                    <div className="flex items-center gap-2 border-t border-white/8 bg-[#0d1929] px-3 py-3">
                        <textarea
                            ref={inputRef}
                            aria-label="Escribe tu mensaje"
                            placeholder="Escribe tu consulta…"
                            value={input}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={handleKey}
                            disabled={loading}
                            rows={2}
                            className="flex-1 max-h-28 min-h-[44px] resize-none rounded-xl bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-0 transition focus:bg-white/12 disabled:opacity-50"
                        />
                        <motion.button
                            type="button"
                            aria-label="Enviar mensaje"
                            onClick={onSend}
                            disabled={!input.trim() || loading}
                            whileTap={{ scale: 0.9 }}
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#D9252A] text-white shadow-md transition-all hover:bg-[#c21f24] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <Send className="size-4" />
                        </motion.button>
                    </div>

                    {/* ── Footer disclaimer ── */}
                    <div className="bg-[#0d1929] px-4 pb-3 text-center">
                        <p className="text-[10px] text-white/20">
                            SORA puede cometer errores · Para cotizaciones escríbenos por WhatsApp
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
