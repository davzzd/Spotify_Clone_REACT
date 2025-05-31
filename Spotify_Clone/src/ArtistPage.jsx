import React, { useState, useEffect } from 'react';
import './ArtistPage.css';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useDataLayerValue } from './DataLayer';
import { useParams } from 'react-router-dom';

function ArtistPage({ spotify }) {
    const [{ }, dispatch] = useDataLayerValue();
    const [artist, setArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                const [artistResponse, topTracksResponse] = await Promise.all([
                    spotify.getArtist(id),
                    spotify.getArtistTopTracks(id, 'US')
                ]);
                
                setArtist(artistResponse);
                setTopTracks(topTracksResponse.tracks);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching artist data:', error);
                setIsLoading(false);
            }
        };

        if (id) {
            fetchArtistData();
        }
    }, [id, spotify]);

    const playArtistTopTracks = async () => {
        try {
            const devices = await spotify.getMyDevices();
            if (devices.devices.length === 0) {
                console.error("No active devices found");
                return;
            }
            
            const activeDevice = devices.devices.find(device => device.is_active) || devices.devices[0];
            await spotify.transferMyPlayback([activeDevice.id], { play: false });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const uris = topTracks.map(track => track.uri);
            await spotify.play({ uris });
            
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
            console.error("Error playing artist top tracks:", error);
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
    };

    if (isLoading) {
        return <div className="artist_page loading">Loading...</div>;
    }

    if (!artist) {
        return <div className="artist_page error">Artist not found</div>;
    }

    return (
        <div className="artist_page">
            <div className="artist_header">
                <img src={artist.images[0]?.url} alt={artist.name} />
                <div className="artist_info">
                    <h1>{artist.name}</h1>
                    <p className="artist_meta">
                        {artist.followers.total.toLocaleString()} followers
                    </p>
                    <button className="play_button" onClick={playArtistTopTracks}>
                        <PlayCircleFilledIcon /> Play 
                    </button>
                </div>
            </div>

            <div className="top_tracks">
                <h2>Popular</h2>
                <div className="tracks_list">
                    {topTracks.map((track, index) => (
                        <div key={track.id} className="track_item" onClick={() => playSong(track.uri)}>
                            <div className="track_number">{index + 1}</div>
                            <div className="track_info">
                                <h4>{track.name}</h4>
                                <p>{track.album.name}</p>
                            </div>
                            <div className="track_duration">
                                {Math.floor(track.duration_ms / 60000)}:
                                {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ArtistPage; 