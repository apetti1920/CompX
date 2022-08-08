import React, {Component} from 'react';
import { connect } from "react-redux";

import Logo from '../Helpers/Logo';
import { User, Play, } from 'react-feather';
import { Container, Navbar, Form } from "react-bootstrap";

import { StateType as SaveState } from '../../../store/types'
import { ThemeType } from "../../../types";
import { SetOpacityHex } from "../../../theme/helpers";

type GlobalProps = {
    theme: ThemeType
}
type DispatchProps = {}
type ComponentProps = {
    style?: React.CSSProperties
};

type PropsType = GlobalProps & DispatchProps & ComponentProps
type StateType = {};

class Overlay extends Component<PropsType, StateType> {
    private TopPadding = "0px 24px 0px 24px";

    constructor(props: PropsType) {
        super(props);
    }

    render() {
        return (
            <div id="overlay" style={{...this.props.style, display: "flex", flexFlow: "column nowrap",
                width: "100%", height: "100%"}}>
                <div style={{
                    width: "100%",
                    height: "150px",
                    background: `linear-gradient(to top, ${SetOpacityHex(this.props.theme.palette.background, 0.0)}, 
                                    ${SetOpacityHex(this.props.theme.palette.background, 1.0)})`,
                    pointerEvents: "auto"
                }}>
                    <Container fluid style={{height: "50px", padding: this.TopPadding}}>
                        <Navbar style={{height: "100%"}}>
                            <Container fluid>
                                <Navbar.Brand style={{userSelect: "none",  color: this.props.theme.palette.text}} >
                                    <Logo color={this.props.theme.palette.text} size="30"/>{' '}
                                    CompX
                                </Navbar.Brand>
                                <Navbar.Collapse className="justify-content-end">
                                    <User stroke={this.props.theme.palette.text}/>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </Container>
                    <Container fluid style={{height: "40px", padding: this.TopPadding}}>
                        <div style={{
                            width: "100%", height: "100%", backgroundColor: this.props.theme.palette.text,
                            borderRadius: "20px", display: "flex", flexFlow: "row nowrap", padding: "0px 20px 0px 20px"
                        }}>
                            <div style={{width: "50%", height: "100%", display: "flex", flexFlow: "row nowrap", alignItems: "center", gap: "5px"}}>

                            </div>
                            <div style={{
                                width: "50%", height: "100%", display: "flex", flexFlow: "row nowrap",
                                justifyContent: "flex-end", alignItems: "center", gap: "5px"
                            }}>
                                <Play stroke={this.props.theme.palette.shadow}
                                      fill={SetOpacityHex(this.props.theme.palette.shadow, 0.5)}/>
                                <style>{`
                                    #simTimeInput::placeholder {
                                      color: ${this.props.theme.palette.text};
                                      opacity: 0.4;
                                    }
                              `}</style>
                                <Form.Control
                                    id="simTimeInput"
                                    type="text" size="sm" placeholder="Simulation Time"
                                    style={{
                                        width: "200px", backgroundColor: this.props.theme.palette.shadow,
                                        color: this.props.theme.palette.text
                                    }}
                                    onChange={()=>console.log("Changed")}/>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        )
    }
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
    return {
        theme: state.userStorage.theme
    };
}

// Exports the redux connected component
export default connect(mapStateToProps, {})(Overlay)
