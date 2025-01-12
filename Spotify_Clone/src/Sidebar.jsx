import React from "react";
import "./Sidebar.css";
import SidebarOption from "./SidebarOption";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { useDataLayerValue } from "./DataLayer";

function Sidebar() {
  const [{ playlists }, dispatch] = useDataLayerValue();
  console.log(playlists); 

  return (
    <div className="sidebar">
      <img
        className="sidebar__logo"
        src="https://www.edigitalagency.com.au/wp-content/uploads/Spotify-Logo-png-RGB-Black.png"
        alt=""
      />
      <SidebarOption Icon={HomeIcon} option="Home" />
      <SidebarOption Icon={SearchIcon} option="Search" />
      <SidebarOption Icon={LibraryMusicIcon} option="Your Library" />
      
      <br />
      <strong className="sidebar__title">PLAYLISTS</strong>
      <hr /> 
      {playlists?.items?.map((playlist) => (
        <SidebarOption option={playlist.name} />
      ))}
            
    </div>
  );
}

export default Sidebar;