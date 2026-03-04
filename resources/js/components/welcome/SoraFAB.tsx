import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import SoraChatPanel, { type ChatMessage } from '@/components/welcome/SoraChatPanel';

interface AuthUser { id: number; name: string }

const GREETING: ChatMessage = {
    role: 'assistant',
    content: '¡Hola! Soy SORA, el asistente virtual de RA AUTOMOTRIZ 👋\n¿En qué te puedo ayudar hoy? Puedo orientarte sobre nuestros servicios, horarios, precios o cómo llegar al taller.',
};

/** Lee el XSRF-TOKEN de la cookie para el header CSRF */
function getCsrfToken(): string {
    const match = document.cookie.split(';').find((c) => c.trim().startsWith('XSRF-TOKEN='));
    if (!match) return '';
    return decodeURIComponent(match.split('=').slice(1).join('='));
}

/** Genera o recupera un session_id único persistido en localStorage */
function getOrCreateSessionId(): string {
    const key = 'sora_session_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }
    return id;
}

const MAX_HISTORY = 10;
const REGISTER_PROMPT_AFTER = 3;

export default function SoraFAB() {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;
    const isGuest = !auth?.user;

    const [open,           setOpen]           = useState(false);
    const [messages,       setMessages]       = useState<ChatMessage[]>([GREETING]);
    const [input,          setInput]          = useState('');
    const [loading,        setLoading]        = useState(false);
    const [sessionId,      setSessionId]      = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [restored,       setRestored]       = useState(false); // si se cargaron mensajes previos

    // ── Al montar: obtener session_id y restaurar conversación del día ──
    useEffect(() => {
        const sid = getOrCreateSessionId();
        setSessionId(sid);

        // Pedir al backend si hay una conversación activa hoy para este dispositivo
        fetch(`/api/sora/session?session_id=${encodeURIComponent(sid)}`, {
            headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data: { conversation: { id: number; messages: Array<{ role: 'user' | 'assistant'; content: string; created_at?: string }> } | null } | null) => {
                if (data?.conversation && data.conversation.messages.length > 0) {
                    setConversationId(data.conversation.id);
                    // Normalizar mensajes previos con createdAt y colocarlos después del saludo
                    const restoredMessages: ChatMessage[] = data.conversation.messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                        createdAt: m.created_at,
                    }));
                    setMessages([GREETING, ...restoredMessages]);
                    setRestored(true);
                }
            })
            .catch(() => { /* silencioso */ });
    }, []);

    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    const showRegisterPrompt = isGuest && userMessageCount >= REGISTER_PROMPT_AFTER;

    async function handleSend() {
        const text = input.trim();
        if (!text || loading || !sessionId) return;

        const nowIso = new Date().toISOString();
        const userMsg: ChatMessage = { role: 'user', content: text, createdAt: nowIso };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setLoading(true);

        try {
            // Historial para la IA: excluir saludo (índice 0), últimos MAX_HISTORY mensajes
            const history = updated
                .slice(1)
                .slice(-MAX_HISTORY)
                .map(({ role, content }) => ({ role, content }));

            const res = await fetch('/api/sora/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    messages:        history,
                    session_id:      sessionId,
                    conversation_id: conversationId,
                    is_guest:        isGuest,
                }),
            });

            if (!res.ok) throw new Error('Error en el servidor');

            const data = await res.json() as { reply: string; conversation_id: number };

            if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
            }

            const replyMsg: ChatMessage = {
                role: 'assistant',
                content: data.reply,
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, replyMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo o escríbenos por WhatsApp.' },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <SoraChatPanel
                open={open}
                messages={messages}
                loading={loading}
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                onClose={() => setOpen(false)}
                showRegisterPrompt={showRegisterPrompt}
                restored={restored}
            />

            {/* FAB button */}
            <motion.button
                type="button"
                aria-label={open ? 'Cerrar asistente SORA' : 'Abrir asistente SORA'}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 left-5 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full shadow-xl"
                style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #D9252A 100%)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
                <span
                    className="absolute inset-0 rounded-full opacity-40"
                    style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite', background: 'linear-gradient(135deg, #1E2D4A, #D9252A)' }}
                    aria-hidden
                />
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <X className="size-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <Bot className="size-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!open && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white bg-[#25d366]" aria-hidden>
                        <span className="block size-1.5 rounded-full bg-white" />
                    </span>
                )}
            </motion.button>
        </>
    );
}
