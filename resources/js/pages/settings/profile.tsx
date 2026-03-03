import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ajustes de perfil',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props as {
        auth: {
            user: {
                first_name?: string;
                last_name?: string;
                document_number?: string;
                email: string;
                email_verified_at: string | null;
            };
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajustes de perfil" />

            <h1 className="sr-only">Ajustes de perfil</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Información del perfil"
                        description="Actualiza tu nombre, apellido, número de documento y correo electrónico"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Nombre y Apellido en fila */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">Nombre</Label>
                                        <Input
                                            id="first_name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.first_name ?? ''}
                                            name="first_name"
                                            required
                                            autoComplete="given-name"
                                            placeholder="Tu nombre"
                                        />
                                        <InputError className="mt-2" message={errors.first_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">Apellido</Label>
                                        <Input
                                            id="last_name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.last_name ?? ''}
                                            name="last_name"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Tu apellido"
                                        />
                                        <InputError className="mt-2" message={errors.last_name} />
                                    </div>
                                </div>

                                {/* Número de documento */}
                                <div className="grid gap-2">
                                    <Label htmlFor="document_number">Número de documento</Label>
                                    <Input
                                        id="document_number"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.document_number ?? ''}
                                        name="document_number"
                                        autoComplete="off"
                                        placeholder="DNI, RUC u otro"
                                    />
                                    <InputError className="mt-2" message={errors.document_number} />
                                </div>

                                {/* Correo */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="correo@ejemplo.com"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Tu correo electrónico no está verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Haz clic aquí para reenviar el correo de verificación.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                Se ha enviado un nuevo enlace de verificación a tu correo.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} data-test="update-profile-button">
                                        Guardar
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Guardado</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
