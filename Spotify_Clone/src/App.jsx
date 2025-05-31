import React, { useEffect, useState } from 'react';
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
import AlbumPage from './AlbumPage';
import ArtistPage from './ArtistPage';
import Notification from './Notification';

const spotify = new SpotifyWebApi();

function App() {
  const [{ token }, dispatch] = useDataLayerValue();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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

  const showGlobalNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  return (
    <div className="app">
      {token ? (
        <Router>
          <div className="app_body">
            <Sidebar spotify={spotify} />
            <Routes>
              <Route path="/" element={<Body spotify={spotify} onShowNotification={showGlobalNotification} />} />
              <Route path="/search" element={<SearchPage spotify={spotify} onShowNotification={showGlobalNotification} />} />
              <Route path="/album/:id" element={<AlbumPage spotify={spotify} onShowNotification={showGlobalNotification} />} />
              <Route path="/artist/:id" element={<ArtistPage spotify={spotify} onShowNotification={showGlobalNotification} />} />
            </Routes>
          </div>
          <Footer spotify={spotify} />
          <Notification 
            isVisible={showNotification}
            message={notificationMessage}
            onClose={() => setShowNotification(false)}
          />
        </Router>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
