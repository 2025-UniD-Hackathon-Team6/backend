import { SetMetadata } from '@nestjs/common';

export const AUTH_NOT_NEEDED_KEY = 'auth-not-needed';
export const AuthNotNeeded = () => SetMetadata(AUTH_NOT_NEEDED_KEY, true);
