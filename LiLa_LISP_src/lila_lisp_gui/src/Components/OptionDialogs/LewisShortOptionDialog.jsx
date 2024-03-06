import React, {Component} from 'react';

import {executeSparql} from "../Utils/Sparql"
import {documentQuery} from "../Utils/Queries";
import {DialogContent, LinearProgress} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import * as _ from "underscore";

class LewidShortOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows : [],
            columns : [],
            selectedRow : [],
            theDataGridRef : React.createRef()
        }
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
            helpString = "Definitions selected:</br>"
            this.state.selectedRows.forEach(row=>{
                let idsplit = row.split("")
                let element = (_.findWhere(me.state.rows,{lemma:idsplit[1], lc:idsplit[0]})).definition;
                helpStringList.push(element)
            })
            helpString += helpStringList.join("; ");
        }else{
            helpString = "No options were provided for this node"
        }
        this.props.ball.setHelpString(helpString)


        let joinedSelectedRows = ""

        if (this.state.selectedRows !== undefined) {
            this.state.selectedRows.forEach(row => {
                joinedSelectedRows += "<" + row.split("")[0] + "> "
            })
        }
        joinedSelectedRows = joinedSelectedRows.trim()
        if (joinedSelectedRows.length > 0) {
            injections = "VALUES ?lc { " + joinedSelectedRows + " }\n"
        }
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }

    rowSelected = (selectedData) => {
        console.log(selectedData);
        this.setState({selectedRows: selectedData})
        //console.log(selectedData);
    }
    componentDidMount() {
        let me = this
        let query = this.props.ball.getType().generalSPARQL
        const cols = [
            // { field: 'id', headerName: 'ID', width: 0 },
            {
                field: 'lemmaLabel',
                headerName: 'Lemma',
                width: "300",
                editable: false,
            },
            {
                field: 'definition',
                headerName: 'Definition',
                width: "400",
                editable: false,
            }
        ]
        query = query.replace(/injectValue/g, "")
        this.setState({showLoader: true}, () => {
            executeSparql(query, undefined, options => {
                console.log(options);
                me.setState({rows: options, columns: cols, selectedRows: [],showLoader: false})
            })
        })
    }

    render() {
        return (
            <DialogContent dividers>
                {this.state.showLoader === true ? <LinearProgress/> : ""}
                <div style={{ height: 400, width: 'auto' }}>
                    <DataGrid
                        ref={this.state.theDataGridRef}
                        rows={this.state.rows}
                        columns={this.state.columns}
                        getRowId={(row) => row.lc+""+row.lemma}
                        rowsPerPageOptions={[]}

                        pageSize={100}
                        checkboxSelection
                        // disableSelectionOnClick
                        onSelectionModelChange = {(data) => this.rowSelected(data)}
                        selectionModel={this.state.selectedRows}
                    />
                </div>
            </DialogContent>
        );
    }
}


export default LewidShortOptionDialog;
