const config = {
    clientId: process.env.SPOTIFY_CLIENT_ID || 'd6e3508364bc452bb0175ba0dca1039d',
    redirectUri: process.env.SPOTIFY_PROD_REDIRECT_URI || 'https://keen-treacle-3cca6c.netlify.app/callback',
    scopes: process.env.SPOTIFY_SCOPES || 'user-read-currently-playing user-read-recently-played user-top-read user-read-private playlist-read-private user-read-playback-state'
};
export default config;
