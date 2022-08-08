import React from 'react';

export function SetOpacityHex(color: string, opacity: number): string {
    if (opacity < 0.0) opacity = 0.0;
    if (opacity > 1.0) opacity = 1.0;

    let _opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
    return '#' + (color.substring(1) + _opacity.toString(16).toUpperCase() + (_opacity === 0.0 ? "0" : "")).padStart(8, '0');
}

export function HexToRgbA(hex: string, opacity: number = 1.0) {
    if (hex.substring(1).length === 3) hex=`#${hex.substring(1).padStart(6, '0')}`;

    const rx = /^#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})?$/;
    const match = rx.exec(hex);
    if (!match) return hex;

    const r = parseInt(match[1].slice(0, 2), 16);
    const g = parseInt(match[1].slice(2, 4), 16);
    const b = parseInt(match[1].slice(4, 6), 16);

    if (match[2] !== undefined) {
        const a = parseInt(match[2], 16) / 255;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}

export function Glassomorphism(color: string, filterAmount: number, transparencyAmount: number): React.CSSProperties {
    if (filterAmount < 0) filterAmount = 0;
    if (transparencyAmount < 0) transparencyAmount = 0;

    return {
        background: SetOpacityHex(color, transparencyAmount),
        boxShadow: `0 8px 32px 0 rgba( 31, 38, 135, 0.37 )`,
        backdropFilter: `blur( ${filterAmount} )`,
        borderRadius: "10px",
        border: "1px solid rgba( 255, 255, 255, 0.18 )"
    }
}

export const centerItemCss: React.CSSProperties = {
    display: "flex", justifyContent: "center", alignItems: "center"
}

export const buttonCss: React.CSSProperties = {
    display: "inline-block",
    padding: "0.7em 1.4em",
    margin: "0 0.3em 0.3em 0",
    borderRadius: "0.15em",
    boxSizing: "border-box",
    textDecoration: "none",
    fontFamily: "Roboto,sans-serif",
    textTransform: "uppercase",
    fontWeight: 400,
    color: "#FFFFFF",
    backgroundColor: "#3369ff",
    boxShadow: "inset 0 -0.6em 0 -0.35em rgba(0,0,0,0.17)",
    textAlign: "center",
    position: "relative"
}