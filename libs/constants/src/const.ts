export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
  secure: true,
  path: '/auth/reissue',
};
