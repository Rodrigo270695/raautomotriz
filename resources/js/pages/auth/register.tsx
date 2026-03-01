import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { raAuthStyles, raRequiredAsterisk } from '@/components/auth-ra-styles';
import AuthRALoginLayout from '@/layouts/auth/auth-ra-login-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

const ra = raAuthStyles;

/** Valor interno para "ninguna selección"; Radix no permite value="" en SelectItem. */
const DOC_TYPE_PLACEHOLDER = '__none__';

const TIPO_DOC_OPTIONS = [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Cédula de extranjería (CE)' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'ruc', label: 'RUC' },
] as const;

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [documentType, setDocumentType] = useState<string>('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [phone, setPhone] = useState('');

    return (
        <AuthRALoginLayout
            title="Crear cuenta"
            description="Completa tus datos para registrarte"
            wideCard
        >
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4 sm:gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                            {/* Fila 1: Nombres | Apellidos */}
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="first_name" className={ra.label}>
                                    Nombres <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="given-name"
                                    name="first_name"
                                    placeholder="Nombres"
                                    className={ra.input}
                                />
                                <InputError
                                    message={errors.first_name}
                                    className={ra.inputError}
                                />
                            </div>

                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="last_name" className={ra.label}>
                                    Apellidos <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="family-name"
                                    name="last_name"
                                    placeholder="Apellidos"
                                    className={ra.input}
                                />
                                <InputError
                                    message={errors.last_name}
                                    className={ra.inputError}
                                />
                            </div>

                            {/* Fila 2: Tipo de documento | Número de documento */}
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="document_type" className={ra.label}>
                                    Tipo de documento <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <input
                                    type="hidden"
                                    name="document_type"
                                    value={documentType}
                                    readOnly
                                    aria-hidden
                                />
                                <Select
                                    value={documentType || DOC_TYPE_PLACEHOLDER}
                                    onValueChange={(v) =>
                                        setDocumentType(v === DOC_TYPE_PLACEHOLDER ? '' : v ?? '')
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="document_type"
                                        tabIndex={3}
                                        className={ra.selectTrigger}
                                    >
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>
                                    <SelectContent className={ra.selectContent}>
                                        <SelectItem
                                            value={DOC_TYPE_PLACEHOLDER}
                                            className={ra.selectItem}
                                        >
                                            Seleccione...
                                        </SelectItem>
                                        {TIPO_DOC_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                                className={ra.selectItem}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.document_type}
                                    className={ra.inputError}
                                />
                            </div>

                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="document_number" className={ra.label}>
                                    Número de documento <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="document_number"
                                        type="text"
                                        required
                                        tabIndex={4}
                                        autoComplete="off"
                                        name="document_number"
                                        placeholder={
                                            documentType === 'dni'
                                                ? 'Solo 8 dígitos'
                                                : documentType === 'ruc'
                                                  ? 'Solo 11 dígitos'
                                                  : 'Ej. alfanumérico'
                                        }
                                        className={`${ra.input} ${documentType === 'dni' || documentType === 'ruc' ? 'pr-12' : ''}`}
                                        inputMode={documentType === 'dni' || documentType === 'ruc' ? 'numeric' : 'text'}
                                        maxLength={documentType === 'dni' ? 8 : documentType === 'ruc' ? 11 : 20}
                                        value={
                                            documentType === 'dni'
                                                ? documentNumber.replace(/\D/g, '').slice(0, 8)
                                                : documentType === 'ruc'
                                                  ? documentNumber.replace(/\D/g, '').slice(0, 11)
                                                  : documentNumber.slice(0, 20)
                                        }
                                        onChange={(e) =>
                                            setDocumentNumber(
                                                documentType === 'dni'
                                                    ? e.target.value.replace(/\D/g, '').slice(0, 8)
                                                    : documentType === 'ruc'
                                                      ? e.target.value.replace(/\D/g, '').slice(0, 11)
                                                      : e.target.value.slice(0, 20)
                                            )
                                        }
                                    />
                                    {documentType === 'dni' && (
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm tabular-nums text-[#94a3b8]"
                                            aria-hidden
                                        >
                                            {documentNumber.replace(/\D/g, '').length}/8
                                        </span>
                                    )}
                                    {documentType === 'ruc' && (
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm tabular-nums text-[#94a3b8]"
                                            aria-hidden
                                        >
                                            {documentNumber.replace(/\D/g, '').length}/11
                                        </span>
                                    )}
                                </div>
                                <InputError
                                    message={errors.document_number}
                                    className={ra.inputError}
                                />
                            </div>

                            {/* Fila 3: Correo y Celular */}
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="email" className={ra.label}>
                                    Correo <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={5}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    className={ra.input}
                                />
                                <InputError
                                    message={errors.email}
                                    className={ra.inputError}
                                />
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="phone" className={ra.label}>
                                    Celular <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        required
                                        tabIndex={6}
                                        autoComplete="tel"
                                        name="phone"
                                        placeholder="9 dígitos (empieza por 9)"
                                        className={`${ra.input} pr-12`}
                                        maxLength={9}
                                        value={phone}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            const normalized = raw.length > 0 && raw[0] !== '9' ? '9' + raw.slice(1) : raw;
                                            setPhone(normalized);
                                        }}
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm tabular-nums text-[#94a3b8]"
                                        aria-hidden
                                    >
                                        {phone.length}/9
                                    </span>
                                </div>
                                <InputError
                                    message={errors.phone}
                                    className={ra.inputError}
                                />
                            </div>

                            {/* Fila: Contraseña (izq) y Confirmar contraseña (der) */}
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="password" className={ra.label}>
                                    Contraseña <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={7}
                                        autoComplete="new-password"
                                        name="password"
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

                            <div className="grid gap-1.5 sm:gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className={ra.label}
                                >
                                    Confirmar contraseña <span className={raRequiredAsterisk}>*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirm ? 'text' : 'password'}
                                        required
                                        tabIndex={8}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirmar contraseña"
                                        className={`${ra.input} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPasswordConfirm((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-[#94a3b8] outline-none transition-colors hover:text-[#f8fafc] focus-visible:ring-2 focus-visible:ring-[#e12a2d]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2332]"
                                        aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {showPasswordConfirm ? (
                                            <EyeOff className="size-5" aria-hidden />
                                        ) : (
                                            <Eye className="size-5" aria-hidden />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className={ra.inputError}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={`mt-2 w-full ${ra.button}`}
                            tabIndex={9}
                                data-test="register-user-button"
                            size="lg"
                        >
                            {processing && <Spinner />}
                            Crear cuenta
                        </Button>

                        <p className="text-center text-sm text-[#94a3b8]">
                            ¿Ya tienes cuenta?{' '}
                            <Link href={login()} className={ra.linkAccent} tabIndex={10}>
                                Iniciar sesión
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthRALoginLayout>
    );
}
