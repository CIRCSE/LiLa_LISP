import React, {Component} from 'react';
import {createTheme, Dialog, DialogContent, DialogTitle, IconButton, ThemeProvider} from "@mui/material";
import {Close,ArrowCircleDown} from "@mui/icons-material";
import {DataGrid} from "@mui/x-data-grid";
import { CSVLink } from "react-csv";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

class ResultsDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            theDataGridRef: React.createRef(),
            rows : [],
            columns: [],
            idKey : undefined,
            resultsContent: undefined
        }
    }

    openMe = (results,columns,key) => {
        this.setState({openDialog: true,columns:columns, rows:results,idKey:key});
    }

    closeMe = () => {
        this.setState({openDialog: false});
    }

    rowSelected = (data) =>{
        console.log("result click row");
        console.log(data);
        let url = data[0]
        if (data.colDef.useCellData){
            window.open(data.row[data.colDef.cellData], '_blank').focus();
        }else{
            window.open(data.id, '_blank').focus();
        }
        // if (url.includes("lila-erc.eu/data/id/lemma/")){
        //     console.log(url);
        // }else {

        //}
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
                        <DialogTitle>Results


                            <IconButton
                                aria-label="close"
                                style={{
                                    position: 'absolute',
                                    right: 50,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CSVLink data={this.state.rows} style={{color:"#ffffff"}} filename={"LiLa_query_data_download.csv"}>
                                   <ArrowCircleDown/>
                                </CSVLink>
                            </IconButton>

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
                        <DialogContent>
                            <div style={{height: 400, width: 'auto'}}>
                                <DataGrid
                                    ref={this.state.theDataGridRef}
                                    rows={this.state.rows}
                                    columns={this.state.columns}
                                    getRowId={(row) => row[this.state.idKey]}
                                    rowsPerPageOptions={[]}

                                    pageSize={100}
                                    //checkboxSelection
                                    // disableSelectionOnClick
                                    onCellClick={(data) => this.rowSelected(data)}
                                    // onSelectionModelChange={(data) => this.rowSelected(data)}
                                    //selectionModel={this.state.selectedRows}
                                />
                            </div>
                        </DialogContent>

                    </Dialog>
                </ThemeProvider>
            </div>
        );
    }
}


export default ResultsDialog;
