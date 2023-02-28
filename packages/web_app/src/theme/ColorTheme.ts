import { Col } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { ThemeType } from "../types";


type RGBColorType = { r: number, g: number, b: number, a:  number | undefined }
type HSLColorType = { h: number, s: number, l: number }

class Color {
    private readonly value: RGBColorType;

    private constructor(r: number, g: number, b: number, a:  number | undefined) {
        this.value = { r, g, b, a }
    }

    public static fromHexString(color: string): Color {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
        if (result === null) throw Error('Correct Color format not supplied');
        
        return new Color(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            parseInt(result[4], 16) || undefined
        )
    }

    public static fromHSL(color: HSLColorType): Color {
        var r, g, b;

        if(color.s == 0){
            r = g = b = color.l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p: number, q: number, t: number){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = color.l < 0.5 ? color.l * (1 + color.s) : color.l + color.s - color.l * color.s;
            var p = 2 * color.l - q;
            r = hue2rgb(p, q, color.h + 1/3);
            g = hue2rgb(p, q, color.h);
            b = hue2rgb(p, q, color.h - 1/3);
        }

        return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 1.0);
    }

    public static fromRGB(r: number, g: number, b: number, a: number | undefined) {
        if (r < 0 || r > 255 || g < 0 || g > 255 ||b < 0 || b > 255 )
            throw Error(`One or more supplied channel values is not between 0 and 255`);

        return new Color(r, g, b, a);
    }

    public getRGB(): RGBColorType {
        return this.value;
    }

    public getHexString(): string {
        return '#' + Object.values(this.value).map(function(x) {
            if (x === undefined) return
            
            const xStr = x.toString(16);
            return (xStr.length==1) ? "0"+xStr : xStr;
        });
    }

    public getShade(shadeFactor: number): Color {
        return new Color(
            this.value.r * (1 - shadeFactor),
            this.value.g * (1 - shadeFactor),
            this.value.b * (1 - shadeFactor),
            this.value.a
        )
    }
}

class ColorTheme {
    private readonly baseColors: ThemeType
    
    constructor(baseColors: ThemeType) {
        this.baseColors = baseColors
    }

    public GetColors(): Readonly<ThemeType> {
        return this.baseColors;
    }


}