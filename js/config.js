const config = {
    clientId: `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}` || 'd6e3508364bc452bb0175ba0dca1039d',
    redirectUri: `${import.meta.env.VITE_SPOTIFY_PROD_REDIRECT_URI}` || 'https://stellular-maamoul-f64cd9.netlify.app/callback',
    scopes: `${import.meta.env.VITE_SPOTIFY_SCOPES}` || 'user-read-currently-playing user-read-recently-played user-top-read user-read-private playlist-read-private user-read-playback-state'
};
export default config;
