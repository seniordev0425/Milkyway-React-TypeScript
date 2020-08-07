import React, { useState } from 'react';
import Select from 'react-select';
import cogoToast from 'cogo-toast';

import HeadquarterIcon from '../../images/headquarter.svg';
import ManagerIcon from '../../images/manager.svg';
import AssociateIcon from '../../images/associate.svg';

import './registration.scss';

import { useAuth0 } from '../../lib/auth';

import { Button, LoadingButton } from '../../components/button/button-container';
// TODO: check what kind of history is required. Definitely not both?
import { useHistory } from 'react-router';
// import history from '../../lib/history';

import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";

type roleOptionType = {
    label: string,
    value: number
}

const roleOptions = [
    { value: 'associate', label: 'Associate' },
    { value: 'manager', label: 'Manager' },
    { value: 'headquarter', label: 'Headquarter' },
];

const Registration: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims,
        user,
        getTokenSilently
    } = useAuth0();
    // TODO: Cannot move it to util since auth0 is a react hook
    // get the user role
    const claims: any = getIdTokenClaims();
    const userDetails: any = user;
    const userRoles = userDetails[`${namespace}claims/`] ?.roles ?? [];
    // if user has role, forward to home
    // required since /registration is a route that can be technically accessed directly
    if (userRoles.length > 0) {
        history.push("/home");
    }
    const [userName, setUserName] = useState("");
    const [roleSelectedAssociate, setRoleSelectedAssociate] = useState(true);
    const [roleSelectedManager, setRoleSelectedManager] = useState(false);
    const [roleSelectedHeadquarter, setRoleSelectedHeadquarter] = useState(false);
    const [preSharedCode, setPresharedCode] = useState("");
    const [storeCode, setStoreCode] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);
    const onRegisterClick = async () => {
        setRegisterLoading(true);
        if (!(userName)) {
            cogoToast.error('Please enter your name');
            setRegisterLoading(false);
            return;
        };
        if (!(roleSelectedAssociate) && !(roleSelectedManager) && !(roleSelectedHeadquarter)) {
            cogoToast.error('Please select a role');
            setRegisterLoading(false);
            return;
        };
        if ((roleSelectedHeadquarter) && !(preSharedCode)) {
            cogoToast.error('Please add a pre-shared code');
            setRegisterLoading(false);
            return;
        };
        if (((roleSelectedAssociate) || (roleSelectedManager)) && !(storeCode)) {
            cogoToast.error('Please enter your store code');
            setRegisterLoading(false);
            return;
        };
        let userSelectedRole = undefined;
        if (roleSelectedAssociate) {
            userSelectedRole = "associate";
        }
        if (roleSelectedManager) {
            userSelectedRole = "manager";
        }
        if (roleSelectedHeadquarter) {
            userSelectedRole = "headquarter";
        }
        // hit the backend to create the user
        // TODO: refresh the token
        const claims = await getIdTokenClaims();
        const idToken = claims.__raw;
        const userEndPoint = REACT_APP_API_ENDPOINT + "/user";
        const response = await fetch(userEndPoint, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'full_name': userName,
                "role": userSelectedRole,
                "client_code": preSharedCode,
                "store_code": storeCode
            })
        });
        console.log(userEndPoint);
        const responseJson = await response.json();
        console.log(responseJson);
        if (responseJson.success === false) {
            cogoToast.error(responseJson.data);
            setRegisterLoading(false);
            return;
        }
        cogoToast.success("You are registered successfully");
        setRegisterLoading(false);
        // TODO: refresh the token silently
        history.push("/home");
    }
    const handleRoleSelect = (selectedInput: any) => {
        const roleSelected = selectedInput.target.value;
        setRoleSelectedAssociate(false);
        setRoleSelectedManager(false);
        setRoleSelectedHeadquarter(false);
        if (roleSelected == "associate") {
            setRoleSelectedAssociate(true);
        } else if (roleSelected == "manager") {
            setRoleSelectedManager(true);
        } else if (roleSelected == "headquarter") {
            setRoleSelectedHeadquarter(true);
        }
    }
    return (
        <div className="content content--registration registration">
            <div className="content__header registration__header">
                <div className="content__header__text">
                    Enter your details
                </div>
            </div>
            <div className="content__content registration__content">
                <div className="registration__content__item">
                    <label className="pure-material-textfield-outlined">
                        <input placeholder=" "
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onBlur={(e) => setUserName(e.target.value)}
                        />
                        <span>Your name</span>
                    </label>
                </div>
                <div className="registration__content__item">
                    <div className="registration__content__item__title registration__content__item__title--selectrole">
                        Select your role
                    </div>
                    <div className="section payment">
                        <div className="section__content payment__content">
                            <div className="option">
                                <input type="radio" name="role-select" id="associate" value="associate"
                                    onChange={handleRoleSelect}
                                    checked={roleSelectedAssociate} />
                                <label className="payment-label" htmlFor="associate" >
                                    <div className="payment-label__icon">
                                        <img src={AssociateIcon} />
                                    </div>
                                    <div className="payment-label__content--left">
                                        <div className="payment-label__text">
                                            <div className="payment-label__text-title">
                                                Store Associate
                                            </div>
                                        </div>
                                    </div>

                                </label>
                            </div>
                            <div className="option">
                                <input type="radio" name="role-select" id="manager" value="manager"
                                    onChange={handleRoleSelect}
                                    checked={roleSelectedManager} />
                                <label className="payment-label" htmlFor="manager"  >
                                    <div className="payment-label__icon">
                                        <img src={ManagerIcon} />
                                    </div>
                                    <div className="payment-label__content--left">
                                        <div className="payment-label__text">
                                            <div className="payment-label__text-title">
                                                Store Manager
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="option">
                                <input type="radio" name="role-select" id="headquarter" value="headquarter"
                                    onChange={handleRoleSelect}
                                    checked={roleSelectedHeadquarter} />
                                <label className="payment-label" htmlFor="headquarter" >
                                    <div className="payment-label__icon">
                                        <img src={HeadquarterIcon} />
                                    </div>
                                    <div className="payment-label__content--left">
                                        <div className="payment-label__text">
                                            <div className="payment-label__text-title">
                                                Headquarter
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="registration__content__item">
                    {
                        (roleSelectedHeadquarter) ?
                            <label className="pure-material-textfield-outlined">
                                <input placeholder=" "
                                    value={preSharedCode}
                                    onChange={(e) => setPresharedCode(e.target.value)}
                                    onBlur={(e) => setPresharedCode(e.target.value)}
                                />
                                <span>One time login code</span>
                            </label>
                            : <label className="pure-material-textfield-outlined">
                                <input placeholder=" "
                                    value={storeCode}
                                    onChange={(e) => setStoreCode(e.target.value)}
                                    onBlur={(e) => setStoreCode(e.target.value)}
                                />
                                <span>Secret key</span>
                            </label>
                    }
                </div>
            </div>
            <div className="content__cta registration__cta">
                {
                    (registerLoading) ?
                        <LoadingButton
                            className="btn btn--primary btn--full-width"
                            onClick={() => { return null; }}
                        />
                        :
                        <Button
                            className="btn btn--primary btn--full-width"
                            onClick={onRegisterClick}
                            buttonText="Register"
                        />
                }
            </div>
        </div>
    )
}

export default Registration;