import React, {Component} from 'react';
import {Autocomplete, DialogContent, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, TextField} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {executeSparql} from "../Utils/Sparql"
import * as _ from "underscore";

class LemmaBankOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            columns: [],
            selectedRow: [],
            theDataGridRef: React.createRef(),
            injectedValues: [],
            suffixOptions: [],
            prefixOptions: [],
            baseOptions: [],
            genderOptions: [],
            posOptions: [],
            inflectionOptions: [],
            lemmaString: "",
            prefixes: [],
            suffixes: [],
            genders: [],
            basis: [],
            poses: [],
            inflections: [],
            currentInjectedQuery: "",
            showLoader: false

        }
    }

    resultsQuery = "SELECT ?lemma ?lemmaLabel  ?pos ?lexicons where {\n" +
        "  {" +
        "SELECT ?lemma ?poslink ?pos (group_concat(distinct ?wr ; separator=\" \") as ?lemmaLabel) " +
        // "(group_concat(distinct ?lexicon ; separator=\" \") as ?lexicons) WHERE { \n" +
        "  WHERE {\n" +
        "      injectValue\n" +
        "  ?lemma <http://lila-erc.eu/ontologies/lila/hasPOS> ?poslink . \n" +
        "  ?poslink <http://www.w3.org/2000/01/rdf-schema#label> ?pos .\n" +
        "  ?lemma <http://www.w3.org/ns/lemon/ontolex#writtenRep> ?wr .\n" +
        // "optional {\n" +
        // "    ?le <http://www.w3.org/ns/lemon/ontolex#canonicalForm>  ?lemma.\n" +
        // "    ?lexicon <http://www.w3.org/ns/lemon/lime#entry> ?le  .\n" +
        // "  }" +
        "} GROUP BY  ?lemma ?poslink ?pos\n" +
        "  }\n" +
        "} order by ?lemmaLabel"


    lemmaQuery = "SELECT ?lemma ?lemmaLabel WHERE {\n" +
        "      VALUES ?lemmaType {\n" +
        "        lila:Lemma lila:Hypolemma\n" +
        "      }\n" +
        "      ?lemma rdf:type ?lemmaType ;\n" +
        "               rdfs:label ?lemmaLabel.\n" +
        "    }\n" +
        "    order by ?lemmaLabel"


    prefixQuery = "SELECT ?prefisso  ?labelPrefix  WHERE { \n" +
        "      injectValue\n" +
        "      \t\t?lemma <http://lila-erc.eu/ontologies/lila/hasPrefix> ?prefisso.\n" +
        "  \t\t\t?prefisso <http://www.w3.org/2000/01/rdf-schema#label> ?labelPrefix.\n" +
        "    \t\t?prefisso <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://lila-erc.eu/ontologies/lila/Prefix> .\n" +
        "\t\n" +
        "nestedQuery\n" +
        "\t\t} GROUP BY ?prefisso ?labelPrefix ORDER BY ?labelPrefix "

    suffixQuery = "SELECT ?suffisso ?labelSuffix  WHERE { \n" +
        "      injectValue\n" +
        "      \t\t?lemma <http://lila-erc.eu/ontologies/lila/hasSuffix> ?suffisso.\n" +
        "  \t\t\t?suffisso <http://www.w3.org/2000/01/rdf-schema#label> ?labelSuffix.\n" +
        "    \t\t?suffisso <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://lila-erc.eu/ontologies/lila/Suffix> .\n" +
        "\t\n" +
        "nestedQuery\n" +
        "\t\t} GROUP BY ?suffisso ?labelSuffix ORDER BY ?labelSuffix "

    baseQuery = "SELECT ?base ?labelBase  WHERE { \n" +
        "      injectValue\n" +
        "      \t\t?lemma <http://lila-erc.eu/ontologies/lila/hasBase> ?base.\n" +
        "  \t\t\t?base <http://www.w3.org/2000/01/rdf-schema#label> ?labelBase.\n" +
        "    \t\t?base <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://lila-erc.eu/ontologies/lila/Base> .\n" +
        "\t\n" +
        "nestedQuery\n" +
        "\t\t} GROUP BY ?base ?labelBase ORDER BY ?labelBase "


    genderQuery = "SELECT ?gender ?labelGender  WHERE { \n" +
        "      injectValue\n" +
        "\t?lemma <http://lila-erc.eu/ontologies/lila/hasGender> ?gender.\n" +
        "\t?gender <http://www.w3.org/2000/01/rdf-schema#label> ?labelGender.\n" +
        "  \t?gender <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#NamedIndividual> .    \n" +
        "nestedQuery\n" +
        "} GROUP BY ?gender ?labelGender ORDER BY ?labelGender "

    posQuery = "SELECT ?pos ?labelPos  WHERE { \n" +
        "      injectValue\n" +
        "\t?lemma <http://lila-erc.eu/ontologies/lila/hasPOS> ?pos.\n" +
        "\t?pos <http://www.w3.org/2000/01/rdf-schema#label> ?labelPos.\n" +
        "  \t?pos <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#NamedIndividual> .    \n" +
        "nestedQuery\n" +
        "} GROUP BY ?pos ?labelPos ORDER BY ?labelPos "

    inflectionQuery = "SELECT ?inflection ?labelInflection  WHERE { \n" +
        "      injectValue\n" +
        "\t?lemma <http://lila-erc.eu/ontologies/lila/hasInflectionType> ?inflection.\n" +
        "\t?inflection <http://www.w3.org/2000/01/rdf-schema#label> ?labelInflection.\n" +
        "  \t?inflection <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#NamedIndividual> .    \n" +
        "nestedQuery\n" +
        "} GROUP BY ?inflection ?labelInflection ORDER BY ?inflection "


    getOutgoingQuery = () => {
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = ""
        let joinedSelectedRows = ""
        if (this.state.selectedRows !== undefined) {
            this.state.selectedRows.forEach(row => {
                joinedSelectedRows += "<" + row + "> "
            })
        }
        joinedSelectedRows = joinedSelectedRows.trim()
        if (joinedSelectedRows.length > 0) {
            injections = "VALUES ?lemma { " + joinedSelectedRows + " }\n"
        }
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        if (this.state.rows.length > 0) {
            if (this.state.rows.length === this.state.selectedRows.length) {

                let helpString = ""
                if (this.state.lemmaString.length > 0) {
                    helpString += "Lemma Contains \"" + this.state.lemmaString + "\"<br/>"
                }
                if (this.state.prefixes.length > 0) {
                    let pref = []
                    this.state.prefixes.forEach(p=>{
                        pref.push(p.labelPrefix)
                    })
                    helpString += "Prefixes: " + pref.join(", ") + "<br/>"
                }
                if (this.state.suffixes.length > 0) {
                    let suff = []
                    this.state.suffixes.forEach(s=>{
                        suff.push(s.labelSuffix)
                    })
                    helpString += "Suffixes: " + suff.join(", ") + "<br/>"
                }
                if (this.state.basis.length > 0) {
                    let bases = []
                    this.state.basis.forEach(b=>{
                        bases.push(b.labelBase)
                    })
                    helpString += "Base: " + bases.join(", ") + "<br/>"
                }

                if (this.state.poses.length > 0) {
                    let poses = []
                    this.state.poses.forEach(p=>{
                        poses.push(p.labelPos)
                    })
                    helpString += "PoS: " + poses.join(", ") + "<br/>"
                }
                if (this.state.inflections.length > 0) {
                    let inflections = []
                    this.state.inflections.forEach(i=>{
                        inflections.push(i.labelInflection)
                    })
                    helpString += "Inflection: " + inflections.join(", ") + "<br/>"
                }



                if (helpString.length === 0) {
                    helpString = "No options were provided for this node"
                }
                this.props.ball.setHelpString(helpString)
                this.props.ball.setInjectedValues("")
                return this.state.currentInjectedQuery
            } else {

                let me = this
                let helpString = ""
                if (this.state.selectedRows.length > 0) {
                    let helpStringList = []
                    helpString = "Lemma selected:</br>"
                    this.state.selectedRows.forEach(row => {
                        let element = (_.findWhere(me.state.rows, {lemma: row})).lemmaLabel;
                        helpStringList.push(element)
                    })
                    helpString += helpStringList.join(", ");
                } else {
                    helpString = "No options were provided for this node"
                }
                this.props.ball.setHelpString(helpString)
                this.props.ball.setInjectedValues(injections)
            }
        }else{

               let  helpString = "No options were provided for this node"
            //this.props.ball.setInjectedValues("")
            this.props.ball.setHelpString(helpString)
        }

        return injectedQuery
    }

    getSelectedRows = () => {
        return this.state.selectedRows
    }

    getInjectedOptionOutput = () => {
        return this.state.injectedValues
    }


    loadSelectOptions(query, injectValues, uriField, labelField, callback) {
        let injectedQuery = query.replace(/nestedQuery/g, "")
        let injections = ""
        injectValues.forEach((injection) =>
            injections += injection
        )
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        executeSparql(injectedQuery, [uriField, labelField], options => {
            callback(options)
        })

        //  let options = this.executeSparql(query.replace(/nestedQuery/g, "").replace(/injectValue/g, ""), [uriField, labelField] )

    }


    handleChangeString(property, val) {
        let me = this
        val = val.trim()
        this.setState({[property]: val, rows: []}, () => {
            if (me.timeout) clearTimeout(me.timeout);
            me.timeout = setTimeout(function () {
                let tmp = me.getNewInjectedValue();
                me.setState({injectedValues: tmp}, () => {
                    me.loadControlValues()
                    me.getLemmas()
                })
            }.bind(this), 1500)
        })
    }

    getNewInjectedValue = () => {
        let tmp = []
        let me = this

        if (this.state.lemmaString.length > 0) {
            let querystring = this.state.lemmaString.toLocaleLowerCase().replace(/j/g, "i").replace(/v/g, "u")
            tmp.push("?lemma <http://www.w3.org/ns/lemon/ontolex#writtenRep> ?wrp . FILTER regex(?wrp, \"^" + querystring + "\",\"i\") . ")
        }

        me.state.prefixes.forEach(prefix => {
            tmp.push("?lemma <http://lila-erc.eu/ontologies/lila/hasPrefix> <" + prefix.prefisso + "> . \n")
        })

        me.state.suffixes.forEach(suffix => {
            tmp.push("?lemma <http://lila-erc.eu/ontologies/lila/hasSuffix> <" + suffix.suffisso + "> . \n")
        })

        me.state.basis.forEach(base => {
            tmp.push("?lemma  <http://lila-erc.eu/ontologies/lila/hasBase> <" + base.base + "> . \n")
        })

        me.state.genders.forEach(gender => {
            tmp.push("?lemma  <http://lila-erc.eu/ontologies/lila/hasGender> <" + gender.gender + "> . \n")
        })
        me.state.poses.forEach(pos => {
            tmp.push("?lemma  <http://lila-erc.eu/ontologies/lila/hasPOS> <" + pos.pos + "> . \n")
        })
        me.state.inflections.forEach(inflection => {
            tmp.push("?lemma  <http://lila-erc.eu/ontologies/lila/hasInflectionType> <" + inflection.inflection + "> . \n")
        })
        return tmp
    }

    handleChange(property, val) {

        let me = this

        this.setState({[property]: val, injectedValues: [], rows: []}, () => {

            let tmp = me.getNewInjectedValue();

            me.setState({injectedValues: tmp}, () => {
                // console.log(me.state.injectedValues);
                me.loadControlValues()
                console.log(me.state.lemmaString);
                if (me.state.lemmaString !== "" || me.state.injectedValues.length > 0) {
                    me.getLemmas()
                }
            })
        })

    }


    loadControlValues = () => {
        let queries = [this.prefixQuery, this.suffixQuery, this.baseQuery, this.genderQuery, this.posQuery, this.inflectionQuery]
        let me = this
        queries.forEach((query, index) => {
            me.loadSelectOptions(query, this.state.injectedValues, "", "", options => {
                switch (index) {

                    case 0:
                        this.setState({prefixOptions: options})
                        break;
                    case 1:
                        this.setState({suffixOptions: options})
                        break;
                    case 2:
                        let basesNumber = {}
                        options.forEach(base => {
                            if (basesNumber.hasOwnProperty(base.labelBase)) {
                                basesNumber[base.labelBase].push(basesNumber[base.labelBase].length + 1)
                            } else {
                                basesNumber[base.labelBase] = []
                                basesNumber[base.labelBase].push(basesNumber[base.labelBase].length + 1)
                            }
                        })
                        for (const labelBase in basesNumber) {
                            if (basesNumber[labelBase].length === 1) {
                                delete basesNumber[labelBase]
                            }
                        }
                        options.forEach(base => {
                            if (basesNumber.hasOwnProperty(base.labelBase)) {
                                let labelNumber = basesNumber[base.labelBase].shift()
                                base.labelBase = base.labelBase + " " + labelNumber
                            }

                        })


                        this.setState({baseOptions: options})
                        break;
                    case 3:
                        this.setState({genderOptions: options})
                        break;
                    case 4:
                        this.setState({posOptions: options})
                        break;
                    case 5:
                        this.setState({inflectionOptions: options})
                        break;

                }

            })
        })


    }

    getLemmas = () => {
        console.log("get lemma");
        let me = this
        let theQuery = this.resultsQuery

        let injectedQuery = theQuery.replace(/nestedQuery/g, "")
        let injections = ""


        this.state.injectedValues.forEach((injection) =>
            injections += injection
        )
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.setState({showLoader: true, currentInjectedQuery: injectedQuery}, () => {
            executeSparql(injectedQuery, [], data => {
                const cols = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'lemmaLabel',
                        headerName: 'Lemma',
                        width: "240",
                        editable: false,
                    },
                    {
                        field: 'pos',
                        headerName: 'PoS',
                        width: "150",
                        editable: false,
                    }
                ]
                let rows = data
                let selectedRows = []
                data.forEach(item => {
                    selectedRows.push(item.lemma)
                })

                me.setState({rows: rows, columns: cols, selectedRows: selectedRows, showLoader: false})
                // callback(options)
            })
        })

    }

    rowSelected = (selectedData) => {
        this.setState({selectedRows: selectedData})
        //console.log(selectedData);
    }

    componentDidMount() {
        this.loadControlValues()

    }

    render() {
        return (
            <DialogContent dividers>

                <div style={{width: "auto"}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField id="lemmaField" label="Lemma" variant="standard" onChange={(e, val) => {
                                this.handleChangeString("lemmaString", e.target.value, false)
                            }}/>
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.prefixOptions}
                                getOptionLabel={(option) => option.labelPrefix}
                                value={this.state.prefixes}
                                id="prefixField"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("prefixes", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Prefix" variant="standard"/>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.suffixOptions}
                                getOptionLabel={(option) => option.labelSuffix}
                                value={this.state.suffixes}
                                id="suffixField"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("suffixes", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Suffix" variant="standard"/>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.baseOptions}
                                getOptionLabel={(option) => option.labelBase}
                                value={this.state.basis}
                                id="baseField"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("basis", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Base" variant="standard"/>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.genderOptions}
                                getOptionLabel={(option) => option.labelGender}
                                id="genderField"
                                value={this.state.genders}
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("genders", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Gender" variant="standard"/>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.posOptions}
                                getOptionLabel={(option) => option.labelPos}
                                value={this.state.poses}
                                id="posField"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("poses", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="PoS" variant="standard"/>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                multiple
                                fullWidth
                                size="small"
                                options={this.state.inflectionOptions}
                                getOptionLabel={(option) => option.labelInflection}
                                value={this.state.inflections}
                                id="inflectionField"
                                clearOnEscape
                                onChange={(event, newValue) => this.handleChange("inflections", newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Inflection" variant="standard"/>
                                )}
                            /></Grid>
                    </Grid>
                </div>
                <br/>
                {this.state.lemmaString !== "" && this.state.injectedValues.length !== 0 && this.state.showLoader === true ? <LinearProgress/> : ""}
                {this.state.lemmaString === "" && this.state.injectedValues.length === 0 ? <p>No filter selected implies all lemmas</p> :
                    <div style={{height: 400, width: 'auto'}}>
                        <DataGrid
                            ref={this.state.theDataGridRef}
                            rows={this.state.rows}
                            columns={this.state.columns}
                            getRowId={(row) => row.lemma}
                            rowsPerPageOptions={[]}

                            pageSize={100}
                            checkboxSelection
                            // disableSelectionOnClick
                            onSelectionModelChange={(data) => this.rowSelected(data)}
                            selectionModel={this.state.selectedRows}
                        />
                    </div>
                }

            </DialogContent>
        );
    }
}


export default LemmaBankOptionDialog;
