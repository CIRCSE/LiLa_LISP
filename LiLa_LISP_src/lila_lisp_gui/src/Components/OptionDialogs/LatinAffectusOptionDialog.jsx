import React, {Component} from 'react';
import {Autocomplete, DialogContent, Grid, TextField} from "@mui/material";
import * as _ from "underscore";

class LatinAffectusOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polarities: [],
            polarity: [],
            injectedValues: []
        }
    }

    componentDidMount() {
        let pols = []
        pols.push({id: "marl:Positive", polarityLabel: "Positive"})
        pols.push({id: "marl:Neutral", polarityLabel: "Neutral"})
        pols.push({id: "marl:Negative", polarityLabel: "Negative"})
        this.setState({polarities: pols})
    }


    handleChange = (property, val) => {
        let me = this

        this.setState({[property]: val, injectedValues: []}, () => {
            let injections = []
            if (me.state.polarity.length > 0) {
                let injection = "VALUES ?polarity {"
                me.state.polarity.forEach(polarity => {
                    injection += polarity.id + " "
                })
                injection += "}\n"
                injections.push(injection)
                this.setState({injectedValues: injections})
            }
        })
    }

    getOutgoingQuery = () => {
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL


        let me = this
        let helpString = ""

        if (this.state.polarity.length >  0){
            let helpStringList = []
            helpString = "Polarity selected:</br>"
            this.state.polarity.forEach(row=>{

                helpStringList.push(row.polarityLabel)
            })
            helpString += helpStringList.join(", ");
        }else{
            helpString = "No options were provided for this node"
        }
        this.props.ball.setHelpString(helpString)


        let injections = ""
        this.state.injectedValues.forEach((injection) => {
            injections += injection
        })
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }

    render() {
        return (
            <DialogContent dividers>
                <div style={{width: "500px"}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                size="small"
                                multiple
                                options={this.state.polarities}
                                getOptionLabel={(option) => option.polarityLabel}
                                value={this.state.polarity}
                                id="polarity"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("polarity", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Polarity" variant="standard"/>
                                )}
                            />
                        </Grid>


                    </Grid>
                </div>
                <br/>
            </DialogContent>
        );
    }
}


export default LatinAffectusOptionDialog;
