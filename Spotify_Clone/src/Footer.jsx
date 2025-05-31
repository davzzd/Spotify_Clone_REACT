import React,{useEffect,useState,useCallback} from "react";
import "./Footer.css";
//import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RepeatIcon from "@mui/icons-material/Repeat";
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import { useDataLayerValue } from "./DataLayer";

function Footer({spotify}) {
    const [{ token, item, playing }, dispatch] = useDataLayerValue();
    const [volume, setVolume] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [activeDevice, setActiveDevice] = useState(null);

    useEffect(() => {
        const initializePlayer = async () => {
            try {
                const devices = await spotify.getMyDevices();
                if (devices.devices.length > 0) {
                    const device = devices.devices.find(device => device.is_active) || devices.devices[0];
                    setActiveDevice(device);
                    await spotify.transferMyPlayback([device.id], { play: false });
                }

                const playbackState = await spotify.getMyCurrentPlaybackState();
                if (playbackState) {
                    dispatch({
                        type: "SET_PLAYING",
                        playing: playbackState.is_playing,
                    });
                    dispatch({
                        type: "SET_ITEM",
                        item: playbackState.item,
                    });
                }
            } catch (error) {
                console.error("Error initializing player:", error);
            }
        };

        initializePlayer();
    }, [spotify, dispatch]);

    const ensureActiveDevice = async () => {
        if (!activeDevice) {
            const devices = await spotify.getMyDevices();
            if (devices.devices.length === 0) {
                throw new Error("No active devices found");
            }
            const device = devices.devices.find(device => device.is_active) || devices.devices[0];
            setActiveDevice(device);
            await spotify.transferMyPlayback([device.id], { play: false });
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        return activeDevice;
    };
    
    const handlePlayPause = async () => {
        try {
            await ensureActiveDevice();
            
            if (playing) {
                await spotify.pause();
                dispatch({
                    type: "SET_PLAYING",
                    playing: false,
                });
            } else {
                await spotify.play();
                dispatch({
                    type: "SET_PLAYING",
                    playing: true,
                });
            }
        } catch (error) {
            console.error("Error in play/pause:", error);
        }
    };

    const skipNext = async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            const devices = await spotify.getMyDevices();
            if (devices.devices.length === 0) {
                console.error("No active devices found");
                return;
            }

            const activeDevice = devices.devices.find(device => device.is_active) || devices.devices[0];
            await spotify.transferMyPlayback([activeDevice.id], { play: false });
            
            // Reduced delay before skipping
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await spotify.skipToNext();
            
            // Reduced delay before getting the current track
            await new Promise(resolve => setTimeout(resolve, 300));
            
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
            console.error("Error in skipNext:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const skipPrevious = async () => {
        try {
            await ensureActiveDevice();
            
            // Instead of skipping to previous, seek to the start of the current song
            await spotify.seek(0);
            
            // Ensure the song is playing
            if (!playing) {
                await spotify.play();
                dispatch({
                    type: "SET_PLAYING",
                    playing: true,
                });
            }
        } catch (error) {
            console.error("Error restarting song:", error);
        }
    };

    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
    };

    return(
        <div className="footer">
            <div className="footer_left">
                <img className="footer_albumLogo" src={item?.album.images[0].url} alt={item?.name}/>
                {item ? (
                <div className="footer_songInfo">
                    <h4>{item.name}</h4>
                    <p>{item.artists.map((artist) => artist.name).join(", ")}</p>
                </div>
                ) : (
                <div className="footer_songInfo">
                    <h4>No song is playing</h4>
                    <p>...</p>
                </div>
                )}
            </div>

            <div className="footer_center">
                <ShuffleIcon className="footer_green"/>
                <SkipPreviousIcon 
                    onClick={skipPrevious} 
                    className={`footer_icon ${isLoading ? 'footer_icon_disabled' : ''}`}
                />
                {playing ? (
                    <PauseCircleOutlineIcon
                    onClick={handlePlayPause}
                    fontSize="large"
                    className="footer_icon"
                    />
                ) : (
                <PlayCircleOutlineIcon
                    onClick={handlePlayPause}
                    fontSize="large"
                    className="footer_icon"
                />
                )}
                <SkipNextIcon 
                    onClick={skipNext} 
                    className={`footer_icon ${isLoading ? 'footer_icon_disabled' : ''}`}
                />
                <RepeatIcon className="footer_green"/>
            </div>

            <div className="footer_right">
                <Grid container spacing={2}>
                    <Grid item>
                        <PlaylistPlayIcon />
                    </Grid>
                    <Grid item>
                        <VolumeDownIcon />
                    </Grid>
                    <Grid item xs>
                        <Slider 
                            aria-labelledby="continuous-slider"
                            value={volume}
                            onChange={handleVolumeChange}
                            min={0}
                            max={100}
                        />
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}

export default Footer;
