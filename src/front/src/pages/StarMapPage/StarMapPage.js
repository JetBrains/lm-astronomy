import React, {useEffect, useRef, useState, useContext} from 'react';
import d3Celestial from 'd3-celestial';
import {useNavigate} from 'react-router-dom';
import './StarMapPage.css';
import celestialConfig from './celestialConfig'
import SearchParamsContext from '../../components/Contexts/SearchParamsContext';

function StarMap() {
    const {setRa, setDec, setAng} = useContext(SearchParamsContext);
    const navigate = useNavigate();
    const [circleWidth, setCircleWidth] = useState(30);
    const mapRef = useRef(null);
    const celestialRef = useRef(null);
    const [cursorCoords, setCursorCoords] = useState([0, 0]);
    const [selectedCoords, setSelectedCoords] = useState([0, 0]);


    const handleBackClick = () => {
        setRa(Math.round(selectedCoords[0] * 100) / 100);
        setDec(Math.round(selectedCoords[1] * 100) / 100);
        setAng(Math.round(circleWidth * 100) / 100);
        navigate(`/`);

    };

    const handleCircleWidthChange = (e) => {
        const value = e.target.value;
        setCircleWidth(Math.round(Math.pow(10, value)));
    };

    const handleTextInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setCircleWidth(Math.round(value));
        }
    };

    const sliderValue = Math.log10(circleWidth);

    useEffect(() => {
        celestialRef.current = d3Celestial.Celestial();
        celestialRef.current.display(celestialConfig);
    }, []);

    useEffect(() => {
        const lineStyle = {
            stroke: "rgba(216, 235, 85, 0.4)", fill: "rgba(216, 216, 85, 0.9)", width: circleWidth * 4.3
        };

        const handleMouseMove = function (e) {
            const x = e.offsetX;
            const y = e.offsetY;
            const inv = celestialRef.current.mapProjection.invert([x, y]);
            if (inv !== undefined && !isNaN(inv[0])) {
                setCursorCoords(inv);
            }
        };

        const handleDblClick = function (e) {
            const x = e.offsetX;
            const y = e.offsetY;
            const inv = celestialRef.current.mapProjection.invert([x, y]);
            if (inv !== undefined && !isNaN(inv[0])) {
                setSelectedCoords(inv);
            }
        };

        const drawCircle = () => {
            const jsonCircle = {
                "type": "FeatureCollection", "features": [{
                    "type": "Feature", "id": "", "geometry": {
                        "type": "Point", "coordinates": selectedCoords
                    }
                }]
            };

            celestialRef.current.container.selectAll(".circle").remove();
            celestialRef.current.clear();

            celestialRef.current.add({
                type: "raw", callback: () => {
                }, redraw: function () {
                    celestialRef.current.container.selectAll(".circle").remove();

                    const circle = celestialRef.current.getData(jsonCircle, celestialConfig.transform);
                    celestialRef.current.container.selectAll(".circles")
                        .data(circle.features)
                        .enter().append("path")
                        .attr("class", "circle");
                    celestialRef.current.container.selectAll(".circle").each(function (d) {
                        celestialRef.current.setStyle(lineStyle);
                        celestialRef.current.map(d);
                        celestialRef.current.context.fill();
                        celestialRef.current.context.stroke();
                    });
                }
            });
            celestialRef.current.redraw();
        };


        if (mapRef.current) {
            mapRef.current.addEventListener("mousemove", handleMouseMove);
            mapRef.current.addEventListener("dblclick", handleDblClick);
        }

        drawCircle();

        return () => {
            if (mapRef.current) {
                mapRef.current.removeEventListener("mousemove", handleMouseMove);
                mapRef.current.removeEventListener("dblclick", handleDblClick);
            }
        };

    }, [circleWidth, selectedCoords]);

    const {ra, dec, ang} = useContext(SearchParamsContext);

    useEffect(() => {
        celestialRef.current = d3Celestial.Celestial();
        celestialRef.current.display(celestialConfig);


        if (ra && dec) {
            const jsonCircle = {
                "type": "FeatureCollection", "features": [{
                    "type": "Feature", "id": "", "geometry": {
                        "type": "Point", "coordinates": [ra, dec]
                    }
                }]
            };
            celestialRef.current.add({
                type: "raw", callback: () => {
                }, redraw: function () {
                    celestialRef.current.container.selectAll(".circle").remove();
                }, data: jsonCircle
            });
            celestialRef.current.redraw();
        }
    }, [celestialRef.current, setRa, setDec, setAng]);

    return (<div className={"starmap_container"}>
        <div className={"sidebar"}>
            <div className={"coords_selected"}>
                <div>Selected Coordinates:</div>
                <div> Right Ascension: <span className={"selected_ra_input"}>{selectedCoords[0].toFixed(2)}</span></div>

                <div> Declination: <span className={"selected_ra_input"}> {selectedCoords[1].toFixed(2)}</span></div>
                <div>
                                    <span className={"angular"}>Radius: <input className={"angular_input"} type="text"
                                                                               value={circleWidth}
                                                                               onChange={handleTextInputChange}/></span>
                    <input className={"angular_slider"} type="range" min="0" max="2.255" step="0.001"
                           value={sliderValue}
                           onChange={handleCircleWidthChange}/>
                </div>
            </div>
            <button className={'getCoords'} onClick={handleBackClick}>
                <svg width="84" height="90" viewBox="0 0 108 84" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="54" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path
                        d="M106.5 42C106.5 49.1898 101.05 56.042 91.4741 61.1846C81.9602 66.2939 68.7138 69.5 54 69.5C39.2863 69.5 26.0398 66.2939 16.5259 61.1846C6.95 56.042 1.5 49.1898 1.5 42C1.5 34.8102 6.95 27.958 16.5259 22.8154C26.0398 17.7061 39.2863 14.5 54 14.5C68.7138 14.5 81.9602 17.7061 91.4741 22.8154C101.05 27.958 106.5 34.8102 106.5 42Z"
                        stroke="black" strokeWidth="3"/>
                    <circle className={`pupil`} cx="32.0001" cy="36.0006" r="8.78571" stroke="black" strokeWidth="3"/>
                </svg>
                <br/>
                <span>Back to search</span>
            </button>


            <div className={"coords_flow"}>
                <div>Current Coordinates:</div>
                <div> Right Ascension: {cursorCoords[0].toFixed(2)} </div>
                <div> Declination: {cursorCoords[1].toFixed(2)}</div>
            </div>
            <div className={"info"}> Double click on map to selecting coordinates.</div>

        </div>


        <div style={{overflow: 'hidden', margin: '0 auto', width: '800px'}}>
            <div id="celestial-map" ref={mapRef}></div>
        </div>
        <div id="celestial-form"></div>
    </div>);
}

export default StarMap;