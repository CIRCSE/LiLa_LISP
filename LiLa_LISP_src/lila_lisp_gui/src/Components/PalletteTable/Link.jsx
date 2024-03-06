import React, {Component} from 'react';
import {v4 as uuidv4} from "uuid";

import "./assets/Link.css"

class Link extends Component {
    constructor(props) {
        super(props);


        // console.log(props);

        this.state = {
            ref: React.createRef(),
            startPoint: {x : 0,y: 0},
            endPoint: {x : 0,y: 0},
            startNode: props.startNode,
            endNode: props.endNode,
            lineColor : "#efefef"
        }




        // console.log("Hello I'm here and I'm a " + this.state.type.name + " ball!!");
    }


    hideMe = () =>{
        this.setState({lineColor: "transparent"})
    }
    showMe = () =>{
        this.setState({lineColor: "#efefef"})
    }
    componentDidMount() {

    }

    setStartPoint = (startPoint) =>{
        this.setState({startPoint:startPoint})
    }
    setEndpointPoint = (endPoint) =>{
        this.setState({endPoint:endPoint})
    }

    getStartNode =()=>{
        return this.state.startNode
    }
    getEndNode =()=>{
        return this.state.endNode
    }

    render() {
        return (
            <g ref={this.state.ref} className="linkGroup">
                <line key={uuidv4()} x1={this.state.startPoint.x} y1={this.state.startPoint.y} x2={this.state.endPoint.x} y2={this.state.endPoint.y} stroke={this.state.lineColor} />
            </g>
        )
    }
}


export default Link
