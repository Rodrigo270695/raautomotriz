import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { raAuthStyles } from '@/components/auth-ra-styles';
import AuthRALoginLayout from '@/layouts/auth/auth-ra-login-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

const ra = raAuthStyles;

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthRALoginLayout
            title="¿Olvidaste tu contraseña?"
            description="Introduce tu correo para recibir un enlace para restablecerla"
        >
            <Head title="Recuperar contraseña" />

            {status && (
                <div
                    className="mb-4 rounded-lg px-3 py-2.5 text-center text-sm font-medium"
                    style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                    }}
                >
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-4 pb-6 sm:gap-5 sm:pb-0">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 sm:gap-5">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="email" className={ra.label}>
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    placeholder="correo@ejemplo.com"
                                    className={ra.input}
                                />
                                <InputError
                                    message={errors.email}
                                    className={ra.inputError}
                                />
                            </div>

                            <Button
                                type="submit"
                                className={`mt-1 min-h-[48px] ${ra.button} text-center sm:min-h-[44px]`}
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                                size="lg"
                            >
                                {processing && (
                                    <LoaderCircle className="size-5 shrink-0 animate-spin" />
                                )}
                                <span className="sm:hidden">Enviar enlace</span>
                                <span className="hidden sm:inline">
                                    Enviar enlace para restablecer contraseña
                                </span>
                            </Button>
                        </div>

                        <p className="text-center text-sm leading-snug text-[#94a3b8]">
                            O vuelve a{' '}
                            <Link href={login()} className={ra.linkAccent}>
                                iniciar sesión
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthRALoginLayout>
    );
}
