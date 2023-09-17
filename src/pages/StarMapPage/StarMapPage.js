import React, { useEffect, useRef, useState } from 'react';
import d3Celestial from 'd3-celestial';
import { useNavigate } from 'react-router-dom';
import './StarMapPage.css';
import celestialConfig from './celestialConfig';

function StarMap() {
    const navigate = useNavigate();
    const [circleWidth, setCircleWidth] = useState(30);
    const mapRef = useRef(null);
    const celestialRef = useRef(null);
    const [cursorCoords, setCursorCoords] = useState([0, 0]);
    const [selectedCoords, setSelectedCoords] = useState([0, 0]);

    const handleBackClick = () => {
        navigate(`/?coords=ra:${Math.round(selectedCoords[0] * 100) / 100},dec:${Math.round(selectedCoords[1] * 100) / 100},ang:${Math.round(circleWidth * 100) / 100}°`);
    };

    const handleCircleWidthChange = (e) => {
        const value = e.target.value;
        setCircleWidth(Math.pow(10, value));
    };

    const handleTextInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setCircleWidth(value);
        }
    };

    const sliderValue = Math.log10(circleWidth);

    useEffect(() => {
        celestialRef.current = d3Celestial.Celestial();
        celestialRef.current.display(celestialConfig);
    }, []);

    useEffect(() => {
        const lineStyle = {
            stroke: "rgba(100, 255, 100, 0.3)",
            fill: "rgba(100, 255, 100, 0.5)",
            width: circleWidth * 4.3
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
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "id": "",
                    "geometry": {
                        "type": "Point",
                        "coordinates": selectedCoords
                    }
                }]
            };
            const handleCircleWidthChange = (e) => {
                const value = e.target.value;
                setCircleWidth(Math.pow(10, value));
            };

            const handleTextInputChange = (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    setCircleWidth(value);
                }
            };
            const sliderValue = Math.log10(circleWidth);

            celestialRef.current.container.selectAll(".circle").remove();
            celestialRef.current.clear();

            celestialRef.current.add({
                type: "raw",
                callback: () => {},
                redraw: function () {
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

    return (
        <div>
            <button className={'getCoords'} onClick={handleBackClick}>← <span>Get</span></button>
            <div className={"coords_selected"}>Selected Coords: <br/> RA {selectedCoords[0].toFixed(2)}, DEC: {selectedCoords[1].toFixed(2)}</div>
            <div className={"coords_flow"}>Current Coords: <br/> RA {cursorCoords[0].toFixed(2)}, DEC: {cursorCoords[1].toFixed(2)}</div>
            <input className={"angular_slider"} type="range" min="0" max="2.255" step="0.001" value={sliderValue} onChange={handleCircleWidthChange} />
            <span className={"angular"}>Angular size: <input className={"angular_input"} type="text" value={circleWidth} onChange={handleTextInputChange} />°</span>
            <div className={"info"}> Double click on map to selecting coordinates.</div>
            <div style={{ overflow: 'hidden', margin: '0 auto', width: '800px' }}>
                <div id="celestial-map" ref={mapRef}></div>
            </div>
            <div id="celestial-form"></div>
        </div>
    );
}

export default StarMap;