import React from 'react';

import './sidebarcontent.scss';

import logo from "../../images/logo-square.png";
import tasks from '../../images/tasks.png';
import audit from '../../images/audit.png';
import settings from '../../images/settings.png';
import visible from '../../images/reports.png';
import home from '../../images/home.png';
import promotion from '../../images/promotion.png';
import LogoutIcon from '../../images/logout-v2.png';

import './sidebarcontent-container.tsx';

type SidebarContentType = {
    role: string | undefined,
    currentMenu?: string,
    handleLogout: () => void
}

const SidebarContent: React.FC<SidebarContentType> = (props) => {
    return (
        <div className="sidebarcontent">
            <div id="menu-header" className="sidebarcontent__item sidebarcontent__item--header">
                <span className="sidebarcontent__item__icon">
                    <img src={logo} alt="" />
                </span>
                <span className="sidebarcontent__item__content">
                    Milkyway AI
                </span>
            </div>
            <a id="home" className="sidebarcontent__item" href="/home">
                <span className="sidebarcontent__item__icon">
                    <img src={home} alt="" />
                </span>
                <span className="sidebarcontent__item__content">
                    Home
                </span>
            </a>
            {
                (props.role === 'headquarter') ?
                    <a id="audits" className="sidebarcontent__item" href="/auditschedules">
                        <span className="sidebarcontent__item__icon">
                            <img src={audit} alt="" />
                        </span>
                        <span className="sidebarcontent__item__content">
                            Audit tasks
                        </span>
                    </a>
                    : null
            }
            {
                ((props.role === 'manager') || (props.role === 'associate')) ?
                    <a id="audits" className="sidebarcontent__item" href="/audittasks">
                        <span className="sidebarcontent__item__icon">
                            <img src={audit} alt="" />
                        </span>
                        <span className="sidebarcontent__item__content">
                            Audit tasks
                        </span>
                    </a>
                    : null
            }
            <a id="tasks" className="sidebarcontent__item" href="/customtasks">
                <span className="sidebarcontent__item__icon">
                    <img src={tasks} alt="" />
                </span>
                <span className="sidebarcontent__item__content">
                    Custom tasks
                </span>
            </a>
            <a id="tasks" className="sidebarcontent__item" href="/promotiontasks">
                <span className="sidebarcontent__item__icon">
                    <img src={promotion} alt="" />
                </span>
                <span className="sidebarcontent__item__content">
                    Promotion tasks
                </span>
            </a>
            {
                (props.role !== 'associate') ?
                    <a id="reports" className="sidebarcontent__item" href="/reportselectpre">
                        <span className="sidebarcontent__item__icon">
                            <img src={visible} alt="" />
                        </span>
                        <span className="sidebarcontent__item__content">
                            Reports
                        </span>
                    </a>
                    : null
            }
            {
                (props.role !== 'associate') ?
                    <a id="settings" className="sidebarcontent__item" href="/settings">
                        <span className="sidebarcontent__item__icon">
                            <img src={settings} alt="" />
                        </span>
                        <span className="sidebarcontent__item__content">
                            Settings
                        </span>
                    </a>
                    : null
            }
            <a id="logout" className="sidebarcontent__item" onClick={async (e: React.MouseEvent) => {
                e.preventDefault()
                props.handleLogout();
            }}>
                <span className="sidebarcontent__item__icon">
                    <img src={LogoutIcon} alt="" />
                </span>
                <span className="sidebarcontent__item__content">
                    Logout
                </span>
            </a>
        </div >
    )
}

export default SidebarContent;