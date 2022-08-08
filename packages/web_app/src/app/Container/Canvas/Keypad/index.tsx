// import React, {Component} from 'react';
//
// import { Crosshair, Plus, Minus } from 'react-feather'
// import {Glassomorphism} from "../../../../theme/helpers";
//
// type PropType = {
//     zoomInClick: ()=>void
//     centerClickHandler: ()=>void
//     zoomOutClick: ()=>void
// };
// type StateType = {
//     isHoveringSet: boolean[]
// };
//
// export default class Keypad extends Component<PropType, StateType> {
//     constructor(props: PropType) {
//         super(props);
//
//         this.state = {
//             isHoveringSet: new Array(3).fill(false)
//         }
//     }
//
//     isKeypadHover = () => this.state.isHoveringSet.some(x => x);
//     getHoverCss = (isButtonHover: boolean): React.CSSProperties => {
//         if (isButtonHover) return Glassomorphism(theme.palette.text, 2.0, 0.8)
//
//         if (this.isKeypadHover())
//             return Glassomorphism(theme.palette.text, 2.0, 0.3)
//         else
//             return {}
//     }
//
//     render() {
//         return (
//             <div id="keypad" style={{marginBottom: "30px", marginLeft : "30px", position: "absolute", bottom: "0px",
//                 pointerEvents: 'auto', opacity: this.isKeypadHover()?1.0:0.2, display: "flex", flexFlow: "column nowrap"
//             }}>
//                 <div onClick={this.props.zoomInClick} onMouseEnter={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[0] = true;
//                          this.setState({isHoveringSet: tmpState});
//                      }} onMouseLeave={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[0] = false;
//                          this.setState({isHoveringSet: tmpState});
//                      }}
//                      style={{
//                          ...this.getHoverCss(this.state.isHoveringSet[0]), display: 'flex',
//                          justifyContent: 'center', alignItems: 'center',
//                          padding: '5px', marginBottom: "3px"
//                 }}>
//                     <Plus/>
//                 </div>
//
//                 <div onClick={this.props.centerClickHandler} onMouseEnter={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[1] = true;
//                          this.setState({isHoveringSet: tmpState});
//                      }} onMouseLeave={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[1] = false;
//                          this.setState({isHoveringSet: tmpState});
//                      }}
//                      style={{
//                          ...this.getHoverCss(this.state.isHoveringSet[1]), display: 'flex',
//                          justifyContent: 'center', alignItems: 'center', padding: '5px', marginBottom: "3px"
//                 }}>
//                     <Crosshair/>
//                 </div>
//
//                 <div onClick={this.props.zoomOutClick} onMouseEnter={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[2] = true;
//                          this.setState({isHoveringSet: tmpState});
//                      }} onMouseLeave={()=>{
//                          const tmpState = this.state.isHoveringSet;
//                          tmpState[2] = false;
//                          this.setState({isHoveringSet: tmpState});
//                      }}
//                      style={{
//                          ...this.getHoverCss(this.state.isHoveringSet[2]), display: 'flex',
//                          justifyContent: 'center', alignItems: 'center', padding: '5px'
//                 }}>
//                     <Minus/>
//                 </div>
//             </div>
//         )
//     }
// }

export {}