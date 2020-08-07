import React, { useState } from 'react';
import Slider from "react-slick";
import ImageZoom from 'react-medium-image-zoom';
import Modal from 'react-modal';

import './taskactivities.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PinchZoomPan from './zoomimage';
import { convertDate } from "../../lib/apiWrappers";
import cancel from "../../images/cancel.png";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


type TaskActivitiesProps = {
    activities: any[]
}

const customModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: "90%",
        // height: '60vh', // <-- This sets the height
        overflow: 'scroll'
    }
};

const TaskActivities: React.FC<TaskActivitiesProps> = (props) => {
    const [isImageModalOpen, setisImageModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(-1);
    if (!(props.activities)) {
        return (
            <div className="taskactivities">
                No activities found
            </div>
        )
    }
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <div className="taskactivities">
            <Slider {...settings}>
                {
                    props.activities.map((activity, index) => {
                        var overlayClass = 'modal-hide';
                        if (index === modalIndex) {
                            overlayClass = 'modal-show';
                        }
                        return (
                            <div className="taskactivities__item" key={activity.image_key}>
                                <Modal
                                    isOpen
                                    overlayClassName={overlayClass}
                                    onRequestClose={() =>{
                                        setModalIndex(-1);
                                        setisImageModalOpen(false)
                                    }}
                                    style={customModalStyles}
                                    contentLabel="Confirm"
                                >
                                    <div className="modal__close" onClick={() => {
                                        setModalIndex(-1);
                                        setisImageModalOpen(false)
                                    }}>
                                        <img src={cancel} alt="" />
                                    </div>
                                    {
                                        (activity.image_url) ?
                                        <TransformWrapper>
                                            <TransformComponent>
                                                <img src={`${activity.image_url}`} alt="image" />
                                            </TransformComponent>
                                        </TransformWrapper>
                                        : null
                                    }
                                </Modal>
                                <div className="taskactivities__item__image">
                                    {
                                        (activity.image_url) ?
                                            <img onClick={()=>{
                                                setisImageModalOpen(true);
                                                setModalIndex(index);
                                            }} src={`${activity.image_url}`}/>
                                            :
                                            "No image available"
                                    }

                                </div>
                                <div className="taskactivities__item__text">
                                    <div className="taskactivities__item__description">
                                        {activity.description}
                                    </div>
                                    <div className="taskactivities__item__createdAt">
                                        {convertDate(activity.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </Slider>
        </div>
    )
}

export default TaskActivities;