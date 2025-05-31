import React, { useState, useEffect } from 'react';
import './AlbumPage.css';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useDataLayerValue } from './DataLayer';
import { useParams } from 'react-router-dom';

function AlbumPage({ spotify }) {
    const [{ }, dispatch] = useDataLayerValue();
    const [album, setAlbum] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const response = await spotify.getAlbum(id);
                setAlbum(response);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching album:', error);
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAlbum();
        }
    }, [id, spotify]);

    const playAlbum = async () => {
        try {
            const devices = await spotify.getMyDevices();
            if (devices.devices.length === 0) {
                console.error("No active devices found");
                return;
            }
            
            const activeDevice = devices.devices.find(device => device.is_active) || devices.devices[0];
            await spotify.transferMyPlayback([activeDevice.id], { play: false });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await spotify.play({ context_uri: album.uri });
            
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
            console.error("Error playing album:", error);
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
        return <div className="album_page loading">Loading...</div>;
    }

    if (!album) {
        return <div className="album_page error">Album not found</div>;
    }

    return (
        <div className="album_page">
            <div className="album_header">
                <img src={album.images[0]?.url} alt={album.name} />
                <div className="album_info">
                    <h1>{album.name}</h1>
                    <p className="album_artist">{album.artists.map(artist => artist.name).join(', ')}</p>
                    <p className="album_meta">
                        {album.release_date.split('-')[0]} • {album.tracks.items.length} songs
                    </p>
                    <button className="play_button" onClick={playAlbum}>
                        <PlayCircleFilledIcon /> Play
                    </button>
                </div>
            </div>

            <div className="album_tracks">
                {album.tracks.items.map((track, index) => (
                    <div key={track.id} className="track_item" onClick={() => playSong(track.uri)}>
                        <div className="track_number">{index + 1}</div>
                        <div className="track_info">
                            <h4>{track.name}</h4>
                            <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                        </div>
                        <div className="track_duration">
                            {Math.floor(track.duration_ms / 60000)}:
                            {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AlbumPage; 