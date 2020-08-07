import React from 'react';

import leftArrow from "../../images/left-arrow.png";

type HeaderWithBackProps = {
    label: string,
    backLabel: string,
    backLink: string,
    title: string
}

const HeaderWithBack: React.FC<HeaderWithBackProps> = (props) => {
    return (
        <div className={"content__header " + props.label + "__header"}>
            <div className="content__header__back">
                <a className="content__header__back__link" href={props.backLink}>
                    <div className="content__header__back__icon">
                        <img src={leftArrow} alt="" />
                    </div>
                    <div className="content__header__back__text">
                        {props.backLabel}
                    </div>
                </a>
            </div>
            <div className="content__header__text">
                {props.title}
            </div>
        </div>
    )
}

export default HeaderWithBack;