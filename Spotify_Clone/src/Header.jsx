import React, { useState, useEffect, useRef } from 'react'
import "./Header.css";
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import { useDataLayerValue } from './DataLayer';

function Header({ spotify }) {
    const [{ user }, dispatch] = useDataLayerValue();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [theme, setTheme] = useState('default');
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        const themes = ['default', 'alternate', 'alternate3', 'alternate4'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        // Remove all theme classes
        themes.forEach(t => root.classList.remove(`theme-${t}`));
        // Add new theme class
        if (nextTheme !== 'default') {
            root.classList.add(`theme-${nextTheme}`);
        }
        
        setTheme(nextTheme);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.length > 2) {
            try {
                const response = await spotify.search(value, ['track'], { limit: 5 });
                setSearchResults(response.tracks.items);
                setShowResults(true);
            } catch (error) {
                console.error('Error searching:', error);
            }
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const playSong = async (uri) => {
        try {
            const devices = await spotify.getMyDevices();
            if (devices.devices.length === 0) {
                console.error("No active devices found");
                return;
            }
            
            const activeDevice = devices.devices.find(device => device.is_active) || devices.devices[0];
            await spotify.transferMyPlayback([activeDevice.id], { play: false });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await spotify.play({ uris: [uri] });
            
            const currentTrack = await spotify.getMyCurrentPlayingTrack();
            if (currentTrack?.item) {
                dispatch({
                    type: "SET_ITEM",
                    item: currentTrack.item,
                });
                dispatch({
                    type: "SET_PLAYING",
                    playing: true,
                });
            }
        } catch (error) {
            console.error("Error playing song:", error);
        }
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <div className="header">
            <div className="header_left" ref={searchRef}>
                <SearchIcon />
                <input
                    placeholder="Search for Artists, Songs, or Podcasts"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                {showResults && searchResults.length > 0 && (
                    <div className="search_results">
                        {searchResults.map((track) => (
                            <div
                                key={track.id}
                                className="search_result_item"
                                onClick={() => playSong(track.uri)}
                            >
                                <img src={track.album.images[0]?.url} alt={track.name} />
                                <div className="search_result_info">
                                    <h4>{track.name}</h4>
                                    <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='header_right'>
                <button 
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    Theme
                </button>
                <Avatar src={user?.images[0]?.url} alt={user?.display_name}/>
                <h4>{user?.display_name}</h4>
            </div>
        </div>
    )
}

export default Header
