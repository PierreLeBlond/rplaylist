# r-playlist

## About

A simple interface to switch between playlists in Spotify.
The playlists are hardcoded for now from my Spotify account, and meant to be used for table-top role-playing sessions.

## Development

### Environment

You'll need to provide the following environment variables:

- SPOTIFY_CLIENT_ID: your Spotify client id
- SPOTIFY_CLIENT_SECRET: your Spotify client secret
- PUBLIC_BASE_URL: the base url of your app, e.g. http://localhost:5173

### Commands

`pnpm i`
`pnpm run dev`

## Deployment

On pushing on the remote github repository, a github action will trigger and deploy the project on fly.io.

You'll need to add fly.io related environment variables to github repository secrets:

- FLY_API_TOKEN: your fly.io api token
  As well as the Spotify environment variables:
- SPOTIFY_CLIENT_ID: your Spotify client id
- SPOTIFY_CLIENT_SECRET: your Spotify client secret
