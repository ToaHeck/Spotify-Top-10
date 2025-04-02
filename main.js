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
    sessionStorage.setItem('verifier', verifier);  // Store verifier in sessionStorage
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${challenge}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
}

async function getAccessToken(code) {
    const verifier = sessionStorage.getItem('verifier');  // Retrieve the stored verifier

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: verifier
        })
    });

    const data = await response.json();
    return data;
}

async function fetchTopTracks(token) {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10', {
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }          
    });
    return response.json();
}

function displayTracks(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h3 class="text-light">Your Top Tracks (Last 4 Weeks)</h3>';

    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'list-group';
        item.innerHTML = `
            <a href="${track.external_urls.spotify}" target="_blank" class="list-group-item list-group-item-action">${index + 1}. <b>${track.name}</b> by ${track.artists.map(a => a.name).join(', ')}</a>`;
        resultsDiv.appendChild(item);
        trackArray.push(track.name + " by " + track.artists.map(a => a.name).join(', '));
    });
}

async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        try {
            const data = await getAccessToken(code);
            sessionStorage.setItem('access_token', data.access_token);  // Store access token in sessionStorage
            const tracksData = await fetchTopTracks(data.access_token);
            displayTracks(tracksData.items);
            window.history.replaceState({}, document.title, '/');
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    } else {
        authorize();  // Start the authorization process if no code is found
    }
}

document.addEventListener('DOMContentLoaded', handleCallback);
