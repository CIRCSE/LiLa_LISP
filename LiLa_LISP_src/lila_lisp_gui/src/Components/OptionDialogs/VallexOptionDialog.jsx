import React, {Component} from 'react';
import {Autocomplete, Button, Checkbox, DialogContent, FormControlLabel, FormGroup, Grid, LinearProgress, TextField} from "@mui/material";
import {CircleWithPlus, CircleWithMinus} from "styled-icons/entypo";
import {DataGrid} from "@mui/x-data-grid";
import {executeSparql} from "../Utils/Sparql";
import * as _ from "underscore";

class VallexOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            injectedValues: [],
            functorOptions: [],
            functorValues: [],
            functorControls: [],
            selectedRows: [],
            strictMode : false
        }
    }

    functorQuery = "select ?functor ?functorLabel where {\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinVallex/Lexicon> lime:entry ?le.\n" +
        "  ?le ontolex:evokes ?vf;\n" +
        "      ontolex:canonicalForm ?lemma.\n" +
        "  ?vconcept premon:evokedConcept ?vf.\n" +
        "  ?vf premon:semRole ?roleVf0.\n" +
        "  ?roleVf0 vallex:functor ?functor.\n" +
        "  ?functor rdfs:label ?functorLabel.\n" +
        "} group by ?functor\n" +
        "order by ?functorLabel"


    generateAFunctorControl = () => {
        let me = this
        this.loadSelectOptions(this.functorQuery, this.state.injectedValues, "", "", options => {
            let foptions = me.state.functorOptions
            foptions.push(options)
            let fValues = me.state.functorValues
            fValues.push(null)
            me.setState({functorOptions: foptions, functorValues: fValues}, () => {
                console.log(me.state.functorOptions);
            })
        })

    }


    removeAFunctorControl = () => {
        let me = this


            let fOptions = this.state.functorOptions
            let fValues = this.state.functorValues
            fOptions.pop()
            fValues.pop()
            this.setState({functorOptions: fOptions, functorValues: fValues}, () => {

            })




    }

    loadControlValues = () => {
        let queries = [this.functorQuery]
        let me = this
        queries.forEach((query, index) => {
            me.loadSelectOptions(query, this.state.injectedValues, "", "", options => {
                switch (index) {
                    case 0:
                        console.log(options);
                        this.setState({functorOptions: options})
                        break;

                }

            })
        })
    }

    loadSelectOptions(query, injectValues, uriField, labelField, callback) {
        let injectedQuery = query.replace(/nestedQuery/g, "")
        let injections = ""
        injectValues.forEach((injection) =>
            injections += injection
        )
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        console.log(injectedQuery);
        executeSparql(injectedQuery, [uriField, labelField], options => {
            callback(options)
        })

        //  let options = this.executeSparql(query.replace(/nestedQuery/g, "").replace(/injectValue/g, ""), [uriField, labelField] )

    }


    getOutgoingQuery = () => {

        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = "?vf premon:semRole ?roles.\n"
        let injectHaving = ""

        let me = this
        let helpString = "At least one functor"

        if (this.state.functorValues.length == 1 && this.state.functorValues[0] == null) {
            helpString = "At least one functor"
        } else if (this.state.functorValues.length > 0){
            // injections = ""
            let externalFVariable = []

            helpString = (this.state.strictMode ? "Must have " : "At least ") + this.state.functorValues.length + " functor/s with value/s :<br/>"

            this.state.functorValues.forEach((value, index) => {
                if (value == null) {
                    // injections += "   ?vf premon:semRole ?roleVf" + index + ".\n" +
                    //     "                ?roleVf" + index + " vallex:functor ?f" + index + ".\n"
                    // externalFVariable.push("?f" + index)
                    helpString += "any possible value<br/>"
                } else {

                    injections += "   ?vf premon:semRole ?roleVf" + index + ".\n" +
                        "                ?roleVf" + index + " vallex:functor <" + value.functor + ">.\n"
                    helpString += value.functorLabel + "<br/>"
                }

            })

            let filterString = []
            for (let i = 0; i < externalFVariable.length; i++) {
                for (let j = i + 1; j < externalFVariable.length; j++) {
                    filterString.push(externalFVariable[i] + " != " + externalFVariable[j])
                }
            }
            if (filterString.length > 0) {
                injections += "\nFILTER (" + filterString.join(" && ") + ")\n"
            }

        }

        this.props.ball.setHelpString(helpString)

        if (this.state.strictMode){
            injectHaving = "having (count(?vf) ="+ this.state.functorValues.length +")\n"
        }else{
            injectHaving = "having (count(?vf) >="+ this.state.functorValues.length +")\n"
        }

        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        injectedQuery = injectedQuery.replace(/injectHaving/g, injectHaving)
        this.props.ball.setInjectedValues(injections.replace(/\?vf premon:semRole \?roles\./g,""))
        this.props.ball.setInjectedHaving(injectHaving)
        return injectedQuery
    }


    handleChangeFunctorFiled(property, index, val) {
        let me = this
        let properyVal = this.state[property]
        properyVal[index] = val
        this.setState({[property]: properyVal, injectedValues: [], rows: []}, () => {
            console.log(me.state.functorValues);
        })

    }


    changeStrictMode = () =>{
        let mode = !this.state.strictMode
        this.setState({strictMode:mode})
    }

    componentDidMount() {
        //this.generateAFunctorControl()
    }

    render() {
        let me = this
        return (
            <DialogContent dividers>
                <div style={{width: "auto"}}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <div style={{display: "flex",marginTop:"8px"}}>
                                <Button><CircleWithPlus width={32} onClick={() => {
                                    this.generateAFunctorControl()
                                }}/></Button>
                                <Button><CircleWithMinus width={32} onClick={() => {
                                    this.removeAFunctorControl()
                                }}/></Button>
                                <FormGroup style={{marginLeft:"8px"}}>
                                    <FormControlLabel control={<Checkbox checked={this.state.strictMode} onClick={() => this.changeStrictMode()}/>} label="Strict"/>
                                </FormGroup>
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{marginLeft:"12px"}}>
                            {this.state.functorOptions.map((value, index) => {
                                return <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={value}
                                    getOptionLabel={(option) => option.functorLabel}
                                    value={me.state.functorValues[index]}
                                    id={"functorField" + index}
                                    clearOnEscape
                                    onChange={(event, newValue) => me.handleChangeFunctorFiled("functorValues", index, newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Functor" variant="standard"/>
                                    )}
                                />
                            })
                            }
                            </div>
                        </Grid>

                    </Grid>

                </div>
                <br/>
            </DialogContent>
        );
    }
}


export default VallexOptionDialog;
