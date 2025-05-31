import React, { useState, useEffect, useRef } from 'react';
import './SearchPage.css';
import SearchIcon from '@mui/icons-material/Search';
import { useDataLayerValue } from './DataLayer';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

function SearchPage({ spotify }) {
    const [{ user }, dispatch] = useDataLayerValue();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('track'); // track, artist, or album
    const [isPlaying, setIsPlaying] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.length > 2) {
            try {
                const response = await spotify.search(value, [searchType], { limit: 10 });
                if (searchType === 'track') {
                    setSearchResults(response.tracks.items);
                } else if (searchType === 'artist') {
                    setSearchResults(response.artists.items);
                } else if (searchType === 'album') {
                    setSearchResults(response.albums.items);
                }
            } catch (error) {
                console.error('Error searching:', error);
            }
        } else {
            setSearchResults([]);
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
            setIsPlaying(true);
            
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
    };

    const renderSearchResults = () => {
        if (searchResults.length === 0) return null;

        return (
            <div className="search_results_container">
                {searchResults.map((item) => (
                    <div
                        key={item.id}
                        className="search_result_item"
                        onClick={() => searchType === 'track' && playSong(item.uri)}
                    >
                        <img 
                            src={searchType === 'track' ? item.album.images[0]?.url : 
                                 searchType === 'artist' ? item.images[0]?.url :
                                 item.images[0]?.url} 
                            alt={item.name} 
                        />
                        <div className="search_result_info">
                            <h4>{item.name}</h4>
                            <p>
                                {searchType === 'track' && item.artists.map(artist => artist.name).join(', ')}
                                {searchType === 'artist' && `${item.followers.total.toLocaleString()} followers`}
                                {searchType === 'album' && item.artists.map(artist => artist.name).join(', ')}
                            </p>
                        </div>
                        {searchType === 'track' && (
                            <PlayCircleFilledIcon 
                                className="search_play_button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playSong(item.uri);
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="search_page">
            <div className="search_header">
                <h1>Search for any artist, song, or album</h1>
                <div className="search_types">
                    <button 
                        className={searchType === 'track' ? 'active' : ''} 
                        onClick={() => setSearchType('track')}
                    >
                        Songs
                    </button>
                    <button 
                        className={searchType === 'artist' ? 'active' : ''} 
                        onClick={() => setSearchType('artist')}
                    >
                        Artists
                    </button>
                    <button 
                        className={searchType === 'album' ? 'active' : ''} 
                        onClick={() => setSearchType('album')}
                    >
                        Albums
                    </button>
                </div>
            </div>

            <div className="search_bar_container">
                <SearchIcon />
                <input
                    placeholder={`Search for ${searchType}s...`}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {renderSearchResults()}
        </div>
    );
}

export default SearchPage; 