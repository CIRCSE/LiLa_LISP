import {Component} from "react";

import "./assets/toolboxItem.css"
import {Tooltip} from "@mui/material";


class ToolboxItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type : props.type,
            icon: props.icon
        }
    }

    clickMe = () =>{
        if ( this.props.onClick !== undefined) {
            this.props.onClick(this)
        }
    }

    getType = () =>{
       return (this.state.type)
    }


    render() {
        return (
            <Tooltip title={this.props.tooltip} placement="right">
                <div className={"toolboxItem_Box"} onClick={()=>{this.clickMe()}}>
                    {this.state.icon}
                </div>
            </Tooltip>
        )
    }
}

export default ToolboxItem
