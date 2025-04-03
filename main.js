const clientId = 'd6e3508364bc452bb0175ba0dca1039d'; // Your Spotify Client ID
const redirectUri = 'https://stellular-maamoul-f64cd9.netlify.app/callback'; // Your redirect URI
const scopes = 'user-read-currently-playing user-read-recently-played user-top-read user-read-private playlist-read-private user-read-playback-state';

let trackArray = [];

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

async function authorize() {
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem('verifier', verifier);

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${challenge}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
}

async function getAccessToken(code) {
    const verifier = sessionStorage.getItem('verifier');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
        }),
    });

    return await response.json();
}

async function fetchTopTracks(token) {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return await response.json();
}

function displayTracks(tracks) {
    const results = document.getElementById('results');
    results.innerHTML = '<h3>Your Top Tracks:</h3>';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.innerHTML = `${index + 1}. ${track.name} by ${track.artists[0].name}`;
        results.appendChild(item);
    });
}

async function handleCallback() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        const data = await getAccessToken(code);
        if (data.access_token) {
            const tracks = await fetchTopTracks(data.access_token);
            displayTracks(tracks.items);
        } else {
            console.error('Failed to get access token:', data);
        }
    } else {
        authorize();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('callback')) {
        handleCallback();
    } else {
        document.getElementById('authorize').addEventListener('click', authorize);
    }
});