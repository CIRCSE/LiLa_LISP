import React, {Component} from 'react';
import {Avatar, Dialog, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography} from "@material-ui/core";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import {Close,Folder} from "@material-ui/icons";
import axios from "axios";
import {findAllByDisplayValue} from "@testing-library/react";

class ExampleChooser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            examples: []
        }
    }

    handleToggle() {
        let dialogStatus = this.props.dialogOpen
        this.props.parent.setState({showExample: !dialogStatus})
    }

    selectExample = (ex) =>{
       this.props.selectedExample(ex)
        this.props.parent.setState({showExample: false})
    }

    componentDidMount() {
        let me = this

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            const instance = axios.create();
            instance.defaults.timeout = 5000;
            instance.post(window.LilaSpaqlAccessPointPrefix + 'examples', {}).then(function (response) {
                let list = response.data
                let elements = []
                list.forEach(value => {
                    elements.push(
                        <ListItem button onClick={()=> me.selectExample(value)}>
                            <ListItemText
                                primary={value.title}
                                secondary={value.description}
                            />
                        </ListItem>
                    )
                })
                me.setState({examples : elements})


            })

    }




    render() {
        return (
            <Dialog onClose={() => {
                this.handleToggle()
            }} aria-labelledby="customized-dialog-title" open={this.props.dialogOpen}>
                <MuiDialogTitle id="customized-dialog-title" onClose={() => {
                    this.handleToggle()
                }} style={{fontFamily: 'moonbold'}}>
                    <Typography variant={"h6"} style={{fontFamily: 'moonbold'}}>LiLa query examples</Typography>

                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            this.handleToggle()
                        }}
                        style={{
                            position: 'absolute',
                            right: 8,
                            top: 8
                        }}
                    ><Close/>
                    </IconButton>
                </MuiDialogTitle>
                <MuiDialogContent dividers>
                    <Typography variant={"button"} style={{fontFamily: 'moonbold'}}>
                        A list of useful queries
                    </Typography>
                    <p>
                        <Typography variant={"subtitle2"}>
                            <List dense={true}>
                                {this.state.examples}
                            </List>
                        </Typography>
                    </p>

                </MuiDialogContent>

            </Dialog>
        );
    }
}


export default ExampleChooser;
