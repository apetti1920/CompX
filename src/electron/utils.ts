export function groupBy(xs: any[], key: string): any[][] {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

export function linearInterp(x: number, x0: number, x1: number, y0: number, y1: number): number {
    let temp = ((y0 * (x1 - x) + y1 * (x - x0))) / (x1 - x0)

    if (temp < Math.min(y0, y1)) {
        temp = Math.min(y0, y1)
    }

    if (temp > Math.max(y0, y1)) {
        temp = Math.max(y0, y1)
    }

    return temp;
}

export function Clamp(x: number, min: number, max: number): number {
    if (x < min) {
        x = min
    } else if (x > max) {
        x = max
    }
    return x;
}

const checkImage = (path: string): Promise<boolean> =>
    new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
    });


