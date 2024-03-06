import React, {Component} from 'react';

import {executeSparql} from "../Utils/Sparql"
import {corporaQuery} from "../Utils/Queries";
import {DialogContent} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import * as _ from "underscore";

class CorporaOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows : [],
            columns : [],
            selectedRow : [],
            theDataGridRef : React.createRef()
        }
    }

    getSelectedRows = () =>{

        if (this.state.selectedRows.length === this.state.rows.length){
            return []
        }else{
            return this.state.selectedRows
        }


    }


    getOutgoingQuery = () =>{
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = ""


        let me = this
        let helpString = ""

        if (this.state.selectedRows.length >  0){
            let helpStringList = []
            helpString = "Corpora selected:</br>"
            this.state.selectedRows.forEach(row=>{
                let element = (_.findWhere(me.state.rows,{id:row}).title);
                helpStringList.push(element)
            })
            helpString += helpStringList.join(", ");
        }else{
            helpString = "No options were provided for this node"
        }
        this.props.ball.setHelpString(helpString)





        let joinedSelectedRows = ""
        this.state.selectedRows.forEach(row=>{
            joinedSelectedRows += "<"+row+"> "
        })
        joinedSelectedRows = joinedSelectedRows.trim()
        if (joinedSelectedRows.length >0 ){
            injections = "VALUES ?corpora { "+joinedSelectedRows+" }\n"
        }

        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }



    componentDidMount() {

        executeSparql(corporaQuery,undefined, (data)=>{
            const cols = [
                // { field: 'id', headerName: 'ID', width: 0 },
                {
                    field: 'title',
                    headerName: 'Documents',
                    width: "300",
                    editable: false,
                }
            ]
            let rows = data
            let selectedRows = []
            // data.forEach(item => {
            //     selectedRows.push(item.id)
            // })

            this.setState({rows:rows, columns :cols,selectedRows : selectedRows})
        })
    }
    rowSelected = (selectedData) =>{
        this.setState({selectedRows : selectedData})
        //console.log(selectedData);
    }

    render() {
        return (
            <DialogContent dividers>

                <div style={{ height: 400, width: 'auto' }}>
                    <DataGrid
                        ref={this.state.theDataGridRef}
                        rows={this.state.rows}
                        columns={this.state.columns}

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


export default CorporaOptionDialog;
