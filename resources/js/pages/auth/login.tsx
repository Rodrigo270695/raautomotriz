import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { raAuthStyles } from '@/components/auth-ra-styles';
import AuthRALoginLayout from '@/layouts/auth/auth-ra-login-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

const ra = raAuthStyles;

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthRALoginLayout
            title="Iniciar sesión"
            description="Ingresa tu usuario o documento y contraseña"
        >
            <Head title="Iniciar sesión" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4 sm:gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 sm:gap-5">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="username" className={ra.label}>
                                    Usuario o documento
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Usuario o DNI / documento"
                                    className={ra.input}
                                />
                                <InputError
                                    message={errors.username}
                                    className={ra.inputError}
                                />
                            </div>

                            <div className="grid gap-1.5 sm:gap-2">
                                <div className="flex flex-row flex-nowrap items-center justify-between gap-2">
                                    <Label htmlFor="password" className={`${ra.label} shrink-0`}>
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className={`text-xs sm:text-sm ${ra.linkAccent} shrink-0 text-right`}
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Contraseña"
                                        className={`${ra.input} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-[#94a3b8] outline-none transition-colors hover:text-[#f8fafc] focus-visible:ring-2 focus-visible:ring-[#e12a2d]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2332]"
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-5" aria-hidden />
                                        ) : (
                                            <Eye className="size-5" aria-hidden />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className={ra.inputError}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-0.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className={ra.checkbox}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer font-medium text-[#f8fafc] text-sm select-none"
                                >
                                    Recordarme
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className={`mt-2 ${ra.button}`}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                size="lg"
                            >
                                {processing && <Spinner />}
                                Iniciar sesión
                            </Button>
                        </div>

                        {canRegister && (
                            <p className="text-center text-sm text-[#94a3b8]">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    href={register()}
                                    className={ra.linkAccent}
                                    tabIndex={6}
                                >
                                    Registrarse
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div
                    className="mt-4 rounded-lg px-3 py-2.5 text-center text-sm font-medium"
                    style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                    }}
                >
                    {status}
                </div>
            )}
        </AuthRALoginLayout>
    );
}
