import React, {Component} from 'react';

import {executeSparql} from "../Utils/Sparql"
import {documentQuery} from "../Utils/Queries";
import {DialogContent} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

class BrillOptionDialog extends Component {
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


    componentDidMount() {
        executeSparql(documentQuery,undefined, (data)=>{
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
            data.forEach(item => {
                selectedRows.push(item.id)
            })

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

                <div style={{ height: 400, width: '500px' }}>
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


export default BrillOptionDialog;
