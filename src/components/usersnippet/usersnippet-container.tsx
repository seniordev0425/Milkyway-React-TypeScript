import React, { useState } from 'react';

import { useAuth0 } from '../../lib/auth';
import defaultAvatar from '../../images/default-avatar-v2.svg';
import { fetchGetApi, fetchPutApi, fetchDelApi, convertToFromNow, getStoreDetails, getUser } from '../../lib/apiWrappers';
import { Button, LoadingButton } from '../../components/button/button-container';
import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";
import cogoToast from 'cogo-toast';
import Modal from 'react-modal';

import cancel from "../../images/cancel.png";

type userSnippetProps = {
    userType: string,
    userId: string,
    userImage: string,
    userFullName: string,
    userUpdatedAt: string,
    getUsers: () => void
}

const customDeleteModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: "70%",
        // height: '60vh', // <-- This sets the height
        overflow: 'scroll'
    }
};


const UserSnippet: React.FC<userSnippetProps> = (props) => {
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const {
        getIdTokenClaims
    } = useAuth0();
    const handleClickUserSnippetCTA = async () => {
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        if (props.userType === 'pending') {
            const userApprovalEndPoint = `${REACT_APP_API_ENDPOINT}/user/${props.userId}/approve`;
            const responseUserApproval = await fetchPutApi(userApprovalEndPoint, idToken, {});
            if (responseUserApproval.success) {
                setDeleteModalIsOpen(false);
                cogoToast.success("User successfully approved");
                props.getUsers();
                return;
            }
            setDeleteModalIsOpen(false);
            cogoToast.error("User could not be approved");
            return;
        } else if (props.userType === 'approved') {
            setDeleteModalIsOpen(true);
            const userDeleteEndPoint = `${REACT_APP_API_ENDPOINT}/user/${props.userId}`;
            const responseUserDelete = await fetchDelApi(userDeleteEndPoint, idToken);
            console.log(responseUserDelete);
            if (responseUserDelete.success) {
                setDeleteModalIsOpen(false);
                cogoToast.success("User successfully deleted");
                props.getUsers();
                return;
            }
            setDeleteModalIsOpen(false);
            cogoToast.error("User could not be deleted");
            return;
        } else {
            return null;
        }
    }
    return (
        <div className={`userdetails userdetails--${props.userType}`} key={props.userId}>
            <div className="userdetails__personal">
                <div className="userdetails__personal__left">
                    {
                        (props.userImage) ?
                            null
                            // TODO: When user picture is added, use this
                            :
                            <img src={defaultAvatar} alt="" />
                    }

                </div>
                <div className="userdetails__personal__right">
                    <div className="userdetails__personal__right__top">
                        <div className="userdetails__name">
                            {props.userFullName}
                        </div>
                        <div className="userdetails__time">
                            {convertToFromNow(props.userUpdatedAt)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="userdetails__cta">
                <Button
                    className={(props.userType === 'pending') ? `btn btn--primary` : `btn btn--link-danger`}
                    onClick={() => {
                        if (props.userType === "pending") {
                            handleClickUserSnippetCTA()
                        } else {
                            setDeleteModalIsOpen(true)
                        }
                    }}
                    buttonText={(props.userType === "pending") ? "Approve" : "Remove"}
                />
            </div>
            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={() => setDeleteModalIsOpen(false)}
                style={customDeleteModalStyles}
                contentLabel="Confirm"
            >
                <div className="deletemodal">
                    <div className="deletemodal__header">
                        <div className="addactivitymodal__title">
                            Confirm
                        </div>
                        <div className="deletemodal__close" onClick={() => setDeleteModalIsOpen(false)}>
                            <img src={cancel} alt="" />
                        </div>
                    </div>
                    <div className="deletemodal__content">
                        Are you sure to delete the user?
                    </div>
                    <div className="deletemodal__cta">
                        {
                            (deleteLoading) ?
                                <button className="deletemodal__cta__button btn btn--danger" onClick={() => { return null; }}>
                                    <div className="loadingSpinner"></div>
                                </button>
                                :
                                <button className="deletemodal__cta__button btn btn--danger" onClick={handleClickUserSnippetCTA}>
                                    Yes
                                </button>
                        }
                        <button className="deletemodal__cta__button btn" onClick={() => setDeleteModalIsOpen(false)}>
                            No
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default UserSnippet;