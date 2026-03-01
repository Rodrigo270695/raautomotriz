import type { User } from './models';

export type { User };

export type Auth = {
    user: User | null;
    permissions: string[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
