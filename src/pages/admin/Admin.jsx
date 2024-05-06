import React, { useEffect, useState } from 'react'
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useComments } from "../../contexts/Comments";
import Comment from "../../components/Comment";
import { useUser } from "../../contexts/User";
import { Alert, Snackbar } from "@mui/material";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Favourite from "../../assets/icons/SolidStarIcon";
import { Link } from "react-router-dom";
import VideoPlayerIcon from "../../assets/icons/VideoPlayerIcon";
import PublicIcon from "@mui/icons-material/Public";
import User from "../../assets/images/user.png";
import Calendar from "../../assets/icons/CalendarIcon";

function Admin() {
    const [changeImage, setChangeImage] = useState()
    const [active, setActive] = useState(false)

    const handleImage = (e) => {
        console.log(e);
        let reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            setChangeImage(reader.result);
        };
        reader.onerror = (error) => {
            console.log("Error: ", error);
        };
    };

    const watchActive = () => {
        setActive(true)
    }
    return (
        <section className="movie">
            <div className="movie-container">
                <div className="movie-content">
                    <input
                        className='admin-input'
                        type="file"
                        placeholder="Rasm tanlang yoki sudrab olib tashlang"
                        name="img"
                        accept="img/*"
                        onChange={handleImage}
                    />

                    <div className="movie-info">
                        <div className="movie-text">
                            <div className="movie-first-section">
                                <input type="text" className={active ? 'admin-name_input active' : 'admin-name_input'} />
                                <div className="movie-like-dislike">
                                    <button className="movie-like">
                                        <ThumbUpOffAltIcon />
                                    </button>
                                    <button className="movie-dislike">
                                        <ThumbDownOffAltIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="movie-number_info">
                                <span className="movie-info_title">
                                    <input type="text" className={active ? 'admin-check_input active' : 'admin-check_input'} />
                                    <Calendar />
                                </span>

                                <span className="movie-info_title">
                                    <input type="text" className={active ? 'admin-check_input active' : 'admin-check_input'}/>
                                    <WatchLaterIcon />
                                </span>


                                <span className="movie-info_title">
                                    <input type="text" className={active ? 'admin-grade_input active' : 'admin-grade_input' }/>
                                    <span className="movie-info_icon">
                                        <Favourite />
                                    </span>
                                </span>

                                <span className="movie-info_title">
                                    <input type="text" className={active ? 'admin-country_input active' : 'admin-country_input'}/>
                                    <span className="movie-info_icon">
                                        <PublicIcon />
                                    </span>
                                </span>


                                <span className="movie-info_title">
                                    <input type="text" className={active ? 'admin-check active' : 'admin-check'}/>
                                    <span className="movie-info_icon">
                                        <CheckIcon />
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="movie-btns">
                            <button className="movie-btn">
                                <StarBorderIcon /> Add to Favourite
                            </button>
                            <button className="movie-btn">
                                <AccessTimeIcon /> Add to Watch Later
                            </button>

                            <button className="movie-btn" onClick={watchActive}>
                                Watch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Admin