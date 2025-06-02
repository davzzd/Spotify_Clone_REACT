import React, { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import SidebarOption from "./SidebarOption";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MenuIcon from '@mui/icons-material/Menu';
import { useDataLayerValue } from "./DataLayer";
import { useNavigate } from 'react-router-dom';

function Sidebar({ spotify }) {
  const [{ playlists }, dispatch] = useDataLayerValue();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handlePlaylistClick = async (playlist) => {
    try {
      const response = await spotify.getPlaylist(playlist.id);
      dispatch({
        type: "SET_DISCOVER_WEEKLY",
        discover_weekly: response,
      });
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error loading playlist:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <button className="mobile_menu_button" onClick={toggleMobileMenu} ref={menuButtonRef}>
        <MenuIcon />
      </button>
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile_open' : ''}`} ref={sidebarRef}>
        <img
          className="sidebar__logo"
          src="https://freepnglogo.com/images/all_img/1725820319spotify-logo-black.png"
          alt=""
        />
        <SidebarOption Icon={HomeIcon} option="Home" onClick={() => handleNavigation('/')} />
        <SidebarOption Icon={SearchIcon} option="Search" onClick={() => handleNavigation('/search')} />
        <SidebarOption Icon={LibraryMusicIcon} option="Your Library" onClick={() => handleNavigation('/library')} />
        
        <br />
        <strong className="sidebar__title">PLAYLISTS</strong>
        <hr /> 
        {playlists?.items?.map((playlist) => (
          <SidebarOption 
            key={playlist.id}
            option={playlist.name} 
            onClick={() => handlePlaylistClick(playlist)}
          />
        ))}
      </div>
    </>
  );
}

export default Sidebar;