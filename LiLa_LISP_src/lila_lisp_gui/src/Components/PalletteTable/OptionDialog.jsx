import React, {Component} from 'react';
import {createTheme, Dialog, DialogTitle, IconButton, ThemeProvider} from "@mui/material";
import {Close} from "@mui/icons-material";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

class OptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            dialogContent: undefined,
            thisBall: undefined
        }
    }

    openMe = (ball) => {
        this.setState({openDialog: true, thisBall: ball, dialogContent: ball.current.getOptionDialog()});
    }

    closeMe = () => {
        //    let selectedElements = this.state.thisBall.current.getOptionDialogContentRef().current.getSelectedRows()
        //    let injectedValues = this.state.thisBall.current.getOptionDialogContentRef().current.getInjectedOptionOutput()
        let outgoingQuery = this.state.thisBall.current.getOptionDialogContentRef().current.getOutgoingQuery()
        //    this.state.thisBall.current.setSelectedElements(selectedElements)
        //    this.state.thisBall.current.setInjectedValues(injectedValues)
        this.state.thisBall.current.setOutgoingQuery(outgoingQuery)

        this.setState({openDialog: false});
    }


    render() {

        return (
            <div>
                <ThemeProvider theme={darkTheme}>
                    <Dialog
                        // selectedValue={selectedValue}
                        fullWidth
                        maxWidth={"md"}
                        open={this.state.openDialog}
                        onClose={this.closeMe}
                    >
                        <DialogTitle>{this.state.thisBall !== undefined ? this.state.thisBall.current !== null ? this.state.thisBall.current.getType().text : "": ""} option setup
                            <IconButton
                                aria-label="close"
                                onClick={this.closeMe}
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <Close/>
                            </IconButton>
                        </DialogTitle>

                        {this.state.dialogContent}
                    </Dialog>
                </ThemeProvider>
            </div>
        );
    }
}


export default OptionDialog;
