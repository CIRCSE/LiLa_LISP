import React, {Component} from 'react';
import { DialogContent,  LinearProgress} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {executeSparql} from "../Utils/Sparql";
import * as _ from "underscore";

class WordNetOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theDataGridRef: React.createRef(),
            rows: [],
            columns: [],
            selectedRow: [],
            injectedValues: [],
            synsets: [],
            synset: [],
            senses: [],
            sense: [],
            showLoader: false

        }
    }

    wordnetQuery = "select ?wnsyns ?wnsysLabel ?wnsysDescription where { \n" +
        "      injectValue\n" +
        "  ?le ontolex:evokes ?wnsyns;\n" +
        "      ontolex:canonicalForm ?lemma.\n" +
        "  ?wnsyns rdf:type ontolex:LexicalConcept;\n" +
        "          rdfs:label ?wnsysLabel;\n" +
        "          skos:definition ?wnsysDescription.\n" +
        "} group by ?wnsyns"

    handleChange = (property, val) => {

    }

    getSelectedRows = () => {

    }

    getOutgoingQuery = () => {
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = ""


        let me = this
        let helpString = ""
        console.log(this.state.selectedRows);
        console.log(this.state.rows);
        if (this.state.selectedRows.length >  0){
            let helpStringList = []
            helpString = "Wordnet synset selected:</br>"
            this.state.selectedRows.forEach(row=>{
                let element = (_.findWhere(me.state.rows,{wnsyns:row})).wnsysLabel;
                helpStringList.push(element)
            })
            helpString += helpStringList.join(", ");
        }else{
            helpString = "No options were provided for this node"
        }
        this.props.ball.setHelpString(helpString)

        let joinedSelectedRows = ""

        if (this.state.selectedRows !== undefined) {
            this.state.selectedRows.forEach(row => {
                joinedSelectedRows += "<" + row + "> "
            })
        }
        joinedSelectedRows = joinedSelectedRows.trim()
        if (joinedSelectedRows.length > 0) {
            injections = "VALUES ?wnsyns { " + joinedSelectedRows + " }\n"
        }
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }

    rowSelected = (selectedData) => {
        this.setState({selectedRows: selectedData})
        //console.log(selectedData);
    }

    componentDidMount() {
        let me = this
        let query = this.wordnetQuery
        const cols = [
            // { field: 'id', headerName: 'ID', width: 0 },
            {
                field: 'wnsysLabel',
                headerName: 'Wordnet Sysnet',
                width: "240",
                editable: false,
            },
            {
                field: 'wnsysDescription',
                headerName: 'Sense',
                width: "300",
                editable: false,
            }
        ]
        query = query.replace(/injectValue/g, "")
        this.setState({showLoader: true}, () => {
            executeSparql(query, undefined, options => {
                console.log(options);
                me.setState({rows: options, columns: cols, selectedRows: [], showLoader: false})
            })
        })
    }

    render() {
        return (
            <DialogContent dividers>
                <div style={{width: "auto"}}>
                    {/*<Grid container spacing={2}>*/}
                    {/*    <Grid item xs={6}>*/}
                    {/*        <Autocomplete*/}
                    {/*            size="small"*/}
                    {/*            options={this.state.synsets}*/}
                    {/*            getOptionLabel={(option) => option.labelPrefix}*/}
                    {/*            value={this.state.synset}*/}
                    {/*            id="synset"*/}
                    {/*            clearOnEscape*/}
                    {/*            onChange={(event, newValue) => this.handleChange("synset", newValue)}*/}
                    {/*            renderInput={(params) => (*/}
                    {/*                <TextField {...params} label="Synset" variant="standard"/>*/}
                    {/*            )}*/}
                    {/*        />*/}
                    {/*    </Grid>*/}
                    {/*    <Grid item xs={6}>*/}
                    {/*        <Autocomplete*/}
                    {/*            size="small"*/}
                    {/*            options={this.state.senses}*/}
                    {/*            getOptionLabel={(option) => option.labelPrefix}*/}
                    {/*            value={this.state.sense}*/}
                    {/*            id="sense"*/}
                    {/*            clearOnEscape*/}
                    {/*            onChange={(event, newValue) => this.handleChange("sense", newValue)}*/}
                    {/*            renderInput={(params) => (*/}
                    {/*                <TextField {...params} label="Sense" variant="standard"/>*/}
                    {/*            )}*/}
                    {/*        />*/}
                    {/*    </Grid>*/}
                    {/*</Grid>*/}
                    {this.state.showLoader === true ? <LinearProgress/> : ""}
                    <div style={{height: 400, width: 'auto'}}>
                        <DataGrid
                            ref={this.state.theDataGridRef}
                            rows={this.state.rows}
                            columns={this.state.columns}
                            getRowId={(row) => row.wnsyns}
                            rowsPerPageOptions={[]}

                            pageSize={100}
                            checkboxSelection
                            // disableSelectionOnClick
                            onSelectionModelChange={(data) => this.rowSelected(data)}
                            selectionModel={this.state.selectedRows}
                        />
                    </div>

                </div>
                <br/>
            </DialogContent>
        );
    }
}


export default WordNetOptionDialog;
