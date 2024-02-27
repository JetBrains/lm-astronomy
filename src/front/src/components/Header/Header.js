    import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const location = useLocation();
    const onHomePage = location.pathname === '/';
    return (
        <div className="header">
            <h1 className="title">
                {onHomePage ? (
                    "NIMBUS"
                ) : (
                    <Link to="/" className="home-link">NIMBUS</Link>
                )}
            </h1>
            <p className="subtitle">Neural Interface for Multimessenger Bulletin Understanding and Searching</p>
            <div className="menu">
                <a href="https://lm-astronomy.labs.jb.gg/docs" target="_blank" rel="noopener noreferrer" className="menu-item">API</a>
                <a href="https://github.com/JetBrains/lm-astronomy" target="_blank" rel="noopener noreferrer" className="menu-item">Source</a>
                <a href="https://www.mdpi.com/2075-4434/11/3/63" target="_blank" rel="noopener noreferrer" className="menu-item">Article</a>
                <a href="https://lp.jetbrains.com/research/astroparticle-physics/" target="_blank" rel="noopener noreferrer" className="menu-item">About</a>
            </div>
        </div>
    );
}

export default Header;
