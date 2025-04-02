const config = {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirectUri: import.meta.env.VITE_SPOTIFY_PROD_REDIRECT_URI,
    scopes: import.meta.env.VITE_SPOTIFY_SCOPES
};

export default config;
