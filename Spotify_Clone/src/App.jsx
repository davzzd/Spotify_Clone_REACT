import React, { useEffect } from 'react';
import './App.css';
import Login from './login';
import { getTokenFromUrl } from "./spotify";
import SpotifyWebApi from 'spotify-web-api-js';
import Player from './Player';
import { useDataLayerValue } from './DataLayer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './SearchPage';
import Body from './Body';
import Sidebar from './Sidebar';
import Footer from './Footer';

const spotify = new SpotifyWebApi();

function App() {
  const [{ token }, dispatch] = useDataLayerValue();

  useEffect(() => {
    const hash = getTokenFromUrl();
    window.location.hash = "";

    const _token = hash.access_token;

    if (_token) {
      dispatch({
        type: "SET_TOKEN",
        token: _token,
      });

      spotify.setAccessToken(_token);

      spotify.getMe().then(user => {
        dispatch({
          type: 'SET_USER',
          user: user,
        });
      });

      spotify.getMyTopArtists().then((response) =>
        dispatch({
          type: "SET_TOP_ARTISTS",
          top_artists: response,
        })
      );

      dispatch({
        type: "SET_SPOTIFY",
        spotify: spotify,
      });

      spotify.getUserPlaylists().then((playlists) => {
        dispatch({
          type: 'SET_PLAYLISTS',
          playlists: playlists,
        });

        if (playlists.items.length > 0) {
          const firstPlaylist = playlists.items[1];

          spotify.getPlaylist(firstPlaylist.id).then((response) => {
            dispatch({
              type: "SET_DISCOVER_WEEKLY",
              discover_weekly: response,
            });
          });
        } else {
          console.warn("No playlists found for the user.");
        }
      });
    }

    console.log("i have a token");
  }, [token, dispatch]);

  return (
    <div className="app">
      {token ? (
        <Router>
          <div className="app_body">
            <Sidebar spotify={spotify} />
            <Routes>
              <Route path="/" element={<Body spotify={spotify} />} />
              <Route path="/search" element={<SearchPage spotify={spotify} />} />
            </Routes>
          </div>
          <Footer spotify={spotify} />
        </Router>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
