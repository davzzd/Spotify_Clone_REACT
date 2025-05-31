import React, { useState, useEffect } from 'react';
import './SearchPage.css';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useDataLayerValue } from './DataLayer';
import { useNavigate } from 'react-router-dom';

function SearchPage({ spotify }) {
    const [{ }, dispatch] = useDataLayerValue();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('track');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const searchSpotify = async () => {
            if (searchTerm.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await spotify.search(searchTerm, [searchType], { limit: 20 });
                setSearchResults(response[`${searchType}s`].items);
            } catch (error) {
                console.error('Error searching Spotify:', error);
            }
            setIsLoading(false);
        };

        const timeoutId = setTimeout(searchSpotify, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchType, spotify]);

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
    };

    const handleItemClick = (item) => {
        if (searchType === 'track') {
            playSong(item.uri);
        } else if (searchType === 'album') {
            navigate(`/album/${item.id}`);
        } else if (searchType === 'artist') {
            navigate(`/artist/${item.id}`);
        }
    };

    const renderSearchResults = () => {
        if (isLoading) {
            return <div className="loading">Loading...</div>;
        }

        if (searchResults.length === 0 && searchTerm.length >= 3) {
            return <div className="no_results">No results found</div>;
        }

        return searchResults.map((item) => (
            <div
                key={item.id}
                className="search_result_item"
                onClick={() => handleItemClick(item)}
            >
                <img
                    src={item.images?.[0]?.url || item.album?.images?.[0]?.url}
                    alt={item.name}
                />
                <div className="result_info">
                    <h4>{item.name}</h4>
                    <p>
                        {searchType === 'track'
                            ? item.artists.map(artist => artist.name).join(', ')
                            : searchType === 'album'
                                ? item.artists.map(artist => artist.name).join(', ')
                                : `${item.followers?.total.toLocaleString()} followers`}
                    </p>
                </div>
                {searchType === 'track' && (
                    <button className="search_play_button">
                        <PlayCircleFilledIcon />
                    </button>
                )}
            </div>
        ));
    };

    return (
        <div className="search_page">
            <h1 className="search_heading">Search for any song, artist, or album</h1>
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

            <div className="search_bar_container">
                <input
                    type="text"
                    placeholder={`Search for ${searchType}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="search_results_container">
                {renderSearchResults()}
            </div>
        </div>
    );
}

export default SearchPage; 