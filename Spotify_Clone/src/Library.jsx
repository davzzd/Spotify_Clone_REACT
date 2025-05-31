import React, { useState, useEffect } from 'react';
import './Library.css';
import { useDataLayerValue } from './DataLayer';
import { useNavigate } from 'react-router-dom';

function Library({ spotify }) {
    const [{ playlists }, dispatch] = useDataLayerValue();
    const navigate = useNavigate();

    const handlePlaylistClick = async (playlist) => {
        try {
            const response = await spotify.getPlaylist(playlist.id);
            dispatch({
                type: "SET_DISCOVER_WEEKLY",
                discover_weekly: response,
            });
            navigate('/');
        } catch (error) {
            console.error("Error loading playlist:", error);
        }
    };

    return (
        <div className="library_page">
            <h1 className="library_heading">Your Library</h1>
            <div className="library_grid">
                {playlists?.items?.map((playlist) => (
                    <div 
                        key={playlist.id} 
                        className="library_item"
                        onClick={() => handlePlaylistClick(playlist)}
                    >
                        <div className="library_item_image">
                            <img 
                                src={playlist.images[0]?.url || 'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/default?cb=-1'} 
                                alt={playlist.name}
                            />
                        </div>
                        <div className="library_item_info">
                            <h3>{playlist.name}</h3>
                            <p>{playlist.tracks.total} songs</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Library; 