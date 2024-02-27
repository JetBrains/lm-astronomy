import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CollapsedSearchPanel.css';

function CollapsedSearchPanel(props) {
    const navigate = useNavigate();


    const handleClick = () => {
        navigate('/');
    };

    return (
        <div className="collapsed_search_container" onClick={handleClick}>
            <div className="founded-objects">
                {props.searched}
                <span className={"totalMessages"}> | {props.total} messages found</span>
            </div>

            <div className="back_to_search">
                <svg width="84" height="90" viewBox="0 0 108 84" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="54" cy="42" r="40.5" stroke="black" stroke-width="3"/>
                    <path
                        d="M106.5 42C106.5 49.1898 101.05 56.042 91.4741 61.1846C81.9602 66.2939 68.7138 69.5 54 69.5C39.2863 69.5 26.0398 66.2939 16.5259 61.1846C6.95 56.042 1.5 49.1898 1.5 42C1.5 34.8102 6.95 27.958 16.5259 22.8154C26.0398 17.7061 39.2863 14.5 54 14.5C68.7138 14.5 81.9602 17.7061 91.4741 22.8154C101.05 27.958 106.5 34.8102 106.5 42Z"
                        stroke="black" stroke-width="3"/>
                    <circle className={`pupil`} cx="32.0001" cy="36.0006" r="8.78571" stroke="black" strokeWidth="3"/>
                </svg>
            </div>
        </div>
    );
}

export default CollapsedSearchPanel;
