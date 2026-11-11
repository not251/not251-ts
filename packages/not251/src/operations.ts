function componentwiseProduct(v1: number[], v2: number[], loop: boolean): number[] {
    let out: number[] = [];
    let length = loop ? Math.max(v1.length, v2.length) : Math.min(v1.length, v2.length);

    for (let i = 0; i < length; i++) {
        const component1 = v1[i] !== undefined ? v1[i] : v1[i % v1.length];
        const component2 = v2[i] !== undefined ? v2[i] : v2[i % v2.length];
        out.push(component1 * component2);
    }

    if (!loop) {
        if (v1.length > length) {
            out.push(...v1.slice(length));
        } else if (v2.length > length) {
            out.push(...v2.slice(length));
        }
    }

    return out;
}

function componentwiseSum(v1: number[], v2: number[], loop: boolean): number[] {
    let out: number[] = [];
    let length = loop ? Math.max(v1.length, v2.length) : Math.min(v1.length, v2.length);

    for (let i = 0; i < length; i++) {
        const component1 = v1[i] !== undefined ? v1[i] : v1[i % v1.length];
        const component2 = v2[i] !== undefined ? v2[i] : v2[i % v2.length];
        out.push(component1 + component2);
    }

    if (!loop) {
        if (v1.length > length) {
            out.push(...v1.slice(length));
        } else if (v2.length > length) {
            out.push(...v2.slice(length));
        }
    }

    return out;
}

function componentwiseDivision(v1: number[], v2: number[], loop: boolean): number[] {
    let out: number[] = [];
    let length = loop ? Math.max(v1.length, v2.length) : Math.min(v1.length, v2.length);

    for (let i = 0; i < length; i++) {
        const component1 = v1[i] !== undefined ? v1[i] : v1[i % v1.length];
        const component2 = v2[i] !== undefined ? v2[i] : v2[i % v2.length];
        out.push(component2 !== 0 ? component1 / component2 : 0);
    }

    if (!loop) {
        if (v1.length > length) {
            out.push(...v1.slice(length).map(x => x));
        } else if (v2.length > length) {
            out.push(...v2.slice(length).map(x => x));
        }
    }

    return out;
}

function main() {
    let v1 = [1, 2, 3];
    let v2 = [1, 2, 3, 4];

    console.log("componentwiseProduct with wrap=true:", componentwiseProduct(v1, v2, true));
    console.log("componentwiseProduct with wrap=false:", componentwiseProduct(v1, v2, false));

    console.log("componentwiseSum with wrap=true:", componentwiseSum(v1, v2, true));
    console.log("componentwiseSum with wrap=false:", componentwiseSum(v1, v2, false));

    console.log("componentwiseDivision with wrap=true:", componentwiseDivision(v1, v2, true));
    console.log("componentwiseDivision with wrap=false:", componentwiseDivision(v1, v2, false));
}

main();
