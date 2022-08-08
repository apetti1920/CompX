import React, {Component} from 'react';

import CanvasContainer from "./Canvas/CanvasContainer";
import Overlay from "./Overlay";

type PropType = {};
type StateType = {};

export default class Container extends Component<PropType, StateType> {
    constructor(props: PropType) {
        super(props);
    }

    render() {
        return (
            <div id="main-container" style={{width: "100%", height: "100%", position: "relative"}}>
                <CanvasContainer />
                <Overlay style={{zIndex: 1, position: "relative", pointerEvents: "none"}}/>
            </div>
        )
    }
}