import 'bootstrap';
import 'dotenv/config';



var trackArray = [];


// PKCE Helper Functions
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



// Spotify Config
import config from './config.js';

const clientId = config.clientId;
const redirectUri = config.redirectUri;
const scopes = config.scopes;

// Authorization Flow
async function authorize() {
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('verifier', verifier);
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${challenge}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
}



async function getAccessToken(code) {
    const verifier = localStorage.getItem('verifier');
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
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}



function displayTracks(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h3 class="text-light">Your Top Tracks (Last 4 Weeks)</h3>';

    tracks.forEach((track, index) => {
        var concatStr = ""
        const item = document.createElement('div');
        item.className = 'list-group';
        item.innerHTML = `
            <a href="${track.external_urls.spotify}" target="_blank" class="list-group-item list-group-item-action">${index + 1}. <b>${track.name}</b> by ${track.artists.map(a => a.name).join(', ')}</a>`;
        resultsDiv.appendChild(item);
        concatStr = track.name + " by " + track.artists.map(a => a.name);
        trackArray.push(concatStr)
    });
}



async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        try {
            const data = await getAccessToken(code);
            localStorage.setItem('access_token', data.access_token);
            
            //fetch user's top tracks
            const tracksData = await fetchTopTracks(data.access_token);
            
            //display the top tracks
            displayTracks(tracksData.items);
            
            //clear the URL after processing the authorization code
            window.history.replaceState({}, document.title, '/');
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    } else {
        authorize();
    }
}

document.addEventListener('DOMContentLoaded', handleCallback);


console.log(trackArray)



