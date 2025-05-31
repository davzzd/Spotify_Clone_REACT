import React from "react";
import "./Body.css";
import Header from "./Header";
import { useDataLayerValue } from "./DataLayer";
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SongRow from "./SongRow";

function Body({ spotify, onShowNotification }) {
  const [{ discover_weekly }, dispatch] = useDataLayerValue();

  const playPlaylist = () => {
    if (!discover_weekly?.uri) return;

    spotify
      .play({
        context_uri: discover_weekly.uri,
      })
      .then((res) => {
        spotify.getMyCurrentPlayingTrack().then((r) => {
          dispatch({
            type: "SET_ITEM",
            item: r.item,
          });
          dispatch({
            type: "SET_PLAYING",
            playing: true,
          });
        });
      })
      .catch(() => {
        onShowNotification("Please make sure you have Spotify open on your device (desktop app, web player, or mobile app) to play music.");
      });
  };

  const playSong = (id) => {
    spotify
      .getMyDevices()
      .then((devices) => {
        if (devices.devices.length === 0) {
          onShowNotification("Please make sure you have Spotify open on your device (desktop app, web player, or mobile app) to play music.");
          return;
        }
        
        const activeDevice = devices.devices.find(device => device.is_active) || devices.devices[0];
        
        return spotify.transferMyPlayback([activeDevice.id], { play: false })
          .then(() => {
            return spotify.play({
              uris: [`spotify:track:${id}`],
            });
          })
          .then((res) => {
            spotify.getMyCurrentPlayingTrack().then((r) => {
              dispatch({
                type: "SET_ITEM",
                item: r.item,
              });
              dispatch({
                type: "SET_PLAYING",
                playing: true,
              });
            });
          });
      })
      .catch(() => {
        onShowNotification("Please make sure you have Spotify open on your device (desktop app, web player, or mobile app) to play music.");
      });
  };

  return (
    <div className="body">
      <Header spotify={spotify} />

      <div className="body_info">
        <img src={discover_weekly?.images?.[0]?.url} alt="" />
        <div className="body_infoText">
          <strong>PLAYLIST</strong>
          <h2>{discover_weekly?.name}</h2>
          <p>{discover_weekly?.description}</p>
        </div>
      </div>

      <div className="body_songs">
        <div className="body_icons">
          <PlayCircleFilledIcon className="body_shuffle" onClick={playPlaylist} />
          <FavoriteIcon fontSize="large" />
          <MoreHorizIcon />
        </div>

        {discover_weekly?.tracks?.items?.map((item, index) => (
          <SongRow key={index} playSong={playSong} track={item.track} />
        ))}
      </div>
    </div>
  );
}

export default Body;

