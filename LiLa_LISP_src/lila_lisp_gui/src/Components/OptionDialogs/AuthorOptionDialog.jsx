import React, {Component} from 'react';

import {executeSparql} from "../Utils/Sparql"
import {authorQuery} from "../Utils/Queries";
import { DialogContent, LinearProgress} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import * as _ from "underscore";

class AuthorOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows : [],
            columns : [],
            selectedRow : [],
            theDataGridRef : React.createRef(),
            showLoader : false
        }
    }

    getOutgoingQuery = () => {
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = ""

        let joinedSelectedRows = ""


        let me = this
        let helpString = ""

        if (this.state.selectedRows.length >  0){
            let helpStringList = []
            helpString = "Author selected:</br>"
            this.state.selectedRows.forEach(row=>{
                let element = (_.findWhere(me.state.rows,{author:row}).authorLabel);
                helpStringList.push(element)
            })
            helpString += helpStringList.join(", ");
        }else{
            helpString = "No options were provided for this node"
        }
        this.props.ball.setHelpString(helpString)








        if (this.state.selectedRows !== undefined) {
            this.state.selectedRows.forEach(row => {
                joinedSelectedRows += "<" + row.split("")[0] + "> "
            })
        }
        joinedSelectedRows = joinedSelectedRows.trim()
        if (joinedSelectedRows.length > 0) {
            injections = "VALUES ?author { " + joinedSelectedRows + " }\n"
        }
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }




    componentDidMount() {
        this.setState({showLoader : true})
        executeSparql(authorQuery,undefined, (data)=>{
            const cols = [
                // { field: 'id', headerName: 'ID', width: 0 },
                {
                    field: 'authorLabel',
                    headerName: 'Author',
                    width: "400",
                    editable: false,
                }
            ]
            let rows = data
            let selectedRows = []
            // data.forEach(item => {
            //     selectedRows.push(item.id)
            // })

            this.setState({rows:rows, columns :cols,selectedRows : selectedRows,showLoader : false})
        })
    }
    rowSelected = (selectedData) =>{
        this.setState({selectedRows : selectedData})
        //console.log(selectedData);
    }

    render() {
        return (
            <DialogContent dividers>
                {this.state.showLoader === true ? <LinearProgress /> : ""}
                <div style={{ height: 400, width: 'auto' }}>
                    <DataGrid
                        ref={this.state.theDataGridRef}
                        rows={this.state.rows}
                        columns={this.state.columns}
                        getRowId={(row) => row.author}
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


export default AuthorOptionDialog;
