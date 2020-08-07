import React from "react";
import "./button.scss";

type ButtonProps = {
    className: string;
    onClick: (event: React.MouseEvent) => void;
    buttonText?: React.ReactNode | string;
};

export const Button = (props: ButtonProps) => {
    return (
        <button className={props.className} onClick={props.onClick}>
            {" "}
            {props.buttonText}{" "}
        </button>
    );
};

export const LoadingButton = (props: ButtonProps) => {
    return (
        <button className={props.className} onClick={props.onClick}>
            <div className="loadingSpinner"></div>
        </button>
    );
};
