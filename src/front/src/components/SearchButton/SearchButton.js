import React from 'react';
import './SearchButton.css';

function SearchButton({onSearch, loading, disabled}) {


    return (
        <div className={`search-button ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`} onClick={onSearch}>
            <span className="search-text">SEARCH</span>
            <div className="icons-container">
                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path
                        d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z"
                        stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${loading ? "pupil-spinning" : ""}`} cx="32.0001" cy="36.0006" r="8.78571"
                            stroke="black" strokeWidth="3"/>
                </svg>

                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path
                        d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z"
                        stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${loading ? "pupil-spinning" : ""}`} cx="42.0001" cy="52.0006" r="8.78571"
                            stroke="black" strokeWidth="3"/>
                </svg>

                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path
                        d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z"
                        stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${loading ? "pupil-spinning" : ""}`} cx="52.0001" cy="36.0006" r="8.78571"
                            stroke="black" strokeWidth="3"/>
                </svg>
            </div>
        </div>);
}

export default SearchButton;
