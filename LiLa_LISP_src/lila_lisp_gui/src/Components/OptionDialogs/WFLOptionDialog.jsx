import React, {Component} from 'react';
import {Autocomplete, DialogContent, Grid, TextField} from "@mui/material";
import {executeSparql} from "../Utils/Sparql";

class WFLOptionDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rules: [],
            rule: [],
            wflrules: [],
            wflrule: null,
            categories: [],
            category: null,
            affixes: [],
            affix: null,
            injectedValues: [],
            wflRelationCount: 0
        }
    }


    getOutgoingQuery = () => {
        let injectedQuery = this.props.ball.getType().generalOutgoingSPARQL
        let injections = ""


        if (this.state.injectedValues.length > 0) {

            let helpString = ""

            if (this.state.wflrule !== null) {
                helpString += "WFL rule: " + this.state.wflrule.labelWflRule + "<br/>"
            }
            if (this.state.category !== null) {
                helpString += "Category: " + this.state.category.labelcategory + "<br/>"
            }
            if (this.state.affix !== null) {
                helpString += "Affix: " + this.state.affix.labelaffix + "<br/>"
            }

            if (helpString.length === 0) {
                helpString = "No options were provided for this node"
            }
            this.props.ball.setHelpString(helpString)


        }else{
            this.props.ball.setHelpString("No options were provided for this node")
        }

        this.state.injectedValues.forEach((injection) => {
            injections += injection
            if (injection.includes("affix")) {
                injectedQuery = injectedQuery.replace(/\?wflrelation rdf:type \?category./g, this.queryAffixPatch)
            }
        })
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        this.props.ball.setInjectedValues(injections)
        return injectedQuery
    }


    getInjectedOptionOutput = () => {
        return this.state.injectedValues
    }

    queryAffixPatch = "?wflrelation rdf:type ?category;\n" + "               <http://lila-erc.eu/ontologies/lila/wfl/involves> ?affix."

    wflrulesQuery = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + "\n" + "SELECT ?wflrule ?labelWflRule WHERE {\n" + "      injectValue\n" + "  ?rel <http://www.w3.org/ns/lemon/vartrans#source>|<http://www.w3.org/ns/lemon/vartrans#target> ?le;\n" + "       <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflruleInstance.\n" + "  ?wflruleInstance rdf:type ?category.\n" + "  ?category rdfs:subClassOf ?rule.\n" + "  ?rule rdfs:subClassOf ?wflrule.\n" + "  ?wflrule rdfs:label ?labelWflRule.\n" + "} group by ?wflrule ?labelWflRule\n" + "\n" + "\n"


    rulesQuery = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "   \n" + "select distinct ?rule ?labelRule where{\n" + "      injectValue\n" + "  ?wflrule rdfs:subClassOf <http://lila-erc.eu/ontologies/lila/wfl/WFLRule> .\n" + "  ?rule rdfs:subClassOf ?wflrule ;\n" + "        rdfs:label ?labelRule\n" + "  \t\n" + "}order by ?rule"


    categoryQuery = "PREFIX bif: <http://www.openlinksw.com/schemas/bif#>\n" + "PREFIX lime: <http://www.w3.org/ns/lemon/lime#>\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "select distinct ?category  ?labelcategory where {\n" + "  \n" + "  {\n" + "    select distinct ?category  ?labelcategory where{\n" + "      injectValue\n" + "      GRAPH <http://lila-erc.eu/sparql/lila_knowledge_base/ontologies/WFLOntology>{\n" + "        ?rule rdfs:subClassOf ?wflrule.\n" + "        ?category rdfs:subClassOf ?rule.\n" + "        #?wflrelation <http://lila-erc.eu/ontologies/lila/wfl/involves> ?affix.\n" + "        ?category rdfs:label ?labelcat.\n" + "        ?rule rdfs:label ?rulelabel.\n" + "        BIND(CONCAT(STR( ?rulelabel ), \" - \", STR( ?labelcat ))  AS ?labelcategory ) .\n" + "      }\n" + "    } group by ?category ?labelcategory\n" + "  }\n" + "  ?wflrelation rdf:type ?category.\n" + "  ?rel <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflrelation;\n" + "       <http://www.w3.org/ns/lemon/vartrans#source>|<http://www.w3.org/ns/lemon/vartrans#target> ?le.\n" + "} group by ?category ?labelcategory\n" + "order by ?labelcategory"


    affixQuery = "PREFIX lime: <http://www.w3.org/ns/lemon/lime#>\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "select ?affix ?labelaffix where {\n" + "  {\n" + "    select distinct ?affix  where{\n" + "      injectValue\n" + "      ?rule rdfs:subClassOf ?wflrule.\n" + "      ?category rdfs:subClassOf ?rule.\n" + "      ?wflrelation rdf:type ?category;\n" + "                   <http://lila-erc.eu/ontologies/lila/wfl/involves> ?affix.\n" + "    } group by ?affix \n" + "  }\n" + "  ?affix rdfs:label ?labelaffix.\n" + "}\n" + "order by ?labelaffix"

    getCountNoAffixRelationQuery = "PREFIX bif: <http://www.openlinksw.com/schemas/bif#>\n" + "PREFIX lime: <http://www.w3.org/ns/lemon/lime#>\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "\n" + "select (count (*) as ?count) where {\n" + "\n" + "{select ?rel  where {\n" + "      injectValue\n" + "  \n" + "  ?rel <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflrelation;\n" + "       <http://www.w3.org/ns/lemon/vartrans#source>|<http://www.w3.org/ns/lemon/vartrans#target> ?le.\n" + "  \t\t\n" + "  ?rule rdfs:subClassOf ?wflrule.\n" + "  ?category rdfs:subClassOf ?rule.\n" + "  ?wflrelation rdf:type ?category.\n" + "    } group by ?rel }\n" + "  \n" + "}"

    getCountAffixRelationQuery = "PREFIX bif: <http://www.openlinksw.com/schemas/bif#>\n" + "PREFIX lime: <http://www.w3.org/ns/lemon/lime#>\n" + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + "\n" + "select (count (*) as ?count) where {\n" + "\n" + "{select ?rel  where {\n" + "      injectValue\n" + "  \n" + "  ?rel <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflrelation;\n" + "       <http://www.w3.org/ns/lemon/vartrans#source>|<http://www.w3.org/ns/lemon/vartrans#target> ?le.\n" + "  \t\t\n" + "  ?rule rdfs:subClassOf ?wflrule.\n" + "  ?category rdfs:subClassOf ?rule.\n" + "  ?wflrelation rdf:type ?category;\n" + "               <http://lila-erc.eu/ontologies/lila/wfl/involves> ?affix.\n" + "    } group by ?rel }\n" + "  \n" + "}"


    loadControlValues = () => {
        console.log("load control values")
        let queries = [this.wflrulesQuery, this.rulesQuery, this.categoryQuery, this.affixQuery]
        let me = this
        queries.forEach((query, index) => {

            me.loadSelectOptions(query, this.state.injectedValues, "", "", options => {
                switch (index) {

                    case 0:
                        // patch the wfl rule domain for compound
                        options.forEach(item => {
                            if (item.wflrule == "http://lila-erc.eu/ontologies/lila/wfl/WFLRule") {
                                item.wflrule = "http://lila-erc.eu/ontologies/lila/wfl/CompoundingRule"
                                item.labelWflRule = "Compounding word-formation rule"
                            }
                        })
                        this.setState({wflrules: options})
                        break;
                    case 1:
                        this.setState({rules: options})
                        break;
                    case 2:
                        this.setState({categories: options})
                        break;
                    case 3:
                        this.setState({affixes: options})
                        break;

                }

            })
        })

    }

    loadSelectOptions(query, injectValues, uriField, labelField, callback) {
        let injectedQuery = query.replace(/nestedQuery/g, "")
        let injections = ""
        injectValues.forEach((injection) => injections += injection)
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)

        executeSparql(injectedQuery, [uriField, labelField], options => {
            callback(options)
        })

        //  let options = this.executeSparql(query.replace(/nestedQuery/g, "").replace(/injectValue/g, ""), [uriField, labelField] )

    }

    handleChange = (property, val) => {
        let me = this
        console.log(val);
        this.setState({[property]: val, injectedValues: [], rows: []}, () => {

            let tmp = me.getNewInjectedValue();

            me.setState({injectedValues: tmp}, () => {
                // console.log(me.state.injectedValues);
                me.loadControlValues()
                me.getFormationRelationCount(me.state.injectedValues);
            })
        })
    }


    getNewInjectedValue = () => {
        let tmp = []
        let me = this


        if (me.state.wflrule) {

            // patch compunding rule
            if (this.state.wflrule.wflrule.includes("CompoundingRule")) {
                tmp.push("VALUES ?rule {<" + this.state.wflrule.wflrule + ">}\n")
            } else {
                tmp.push("VALUES ?wflrule {<" + this.state.wflrule.wflrule + ">}\n")
            }

        }

        // me.state.rule.forEach(rule => {
        //     tmp.push("VALUES ?rule {<" + rule.rule + ">}\n")
        // })

        if (this.state.category) {
            tmp.push("VALUES ?category {<" + this.state.category.category + ">}\n?category rdfs:subClassOf ?rule.\n")
        }

        if (this.state.affix) {
            tmp.push("VALUES ?affix {<" + this.state.affix.affix + ">}\n?category rdfs:subClassOf ?rule.\n")
        }

        return tmp
    }

    getFormationRelationCount = (injectValues) => {
        let injectedQuery = this.getCountNoAffixRelationQuery;
        let injections = ""
        injectValues.forEach((injection) => {
            injections += injection
            if (injection.includes("affix")) {
                injectedQuery = this.getCountAffixRelationQuery
            }
        })
        let me = this
        injectedQuery = injectedQuery.replace(/injectValue/g, injections)
        console.log(injectedQuery);
        executeSparql(injectedQuery, ["", ""], count => {
            me.setState({wflRelationCount: count[0].count})
        })


    }


    getSelectedRows = () => {

    }

    componentDidMount() {
        this.loadControlValues()
        this.getFormationRelationCount(this.state.injectedValues);
    }

    render() {
        return (<DialogContent dividers>
            <div style={{width: "auto"}}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Autocomplete

                            fullWidth
                            size="small"
                            options={this.state.wflrules}
                            getOptionLabel={(option) => option.labelWflRule}
                            value={this.state.wflrule}
                            id="wflrule type"
                            clearOnEscape
                            onChange={(event, newValue) => this.handleChange("wflrule", newValue)}
                            renderInput={(params) => (<TextField {...params} label="WFL Rule" variant="standard"/>)}
                        />
                    </Grid>
                    {/*<Grid item xs={6}>*/}
                    {/*    <Autocomplete*/}
                    {/*        multiple*/}
                    {/*        fullWidth*/}
                    {/*        size="small"*/}
                    {/*        options={this.state.rules}*/}
                    {/*        getOptionLabel={(option) => option.labelRule}*/}
                    {/*        value={this.state.rule}*/}
                    {/*        id="rule type"*/}
                    {/*        clearOnEscape*/}
                    {/*        onChange={(event, newValue) => this.handleChange("rule", newValue)}*/}
                    {/*        renderInput={(params) => (*/}
                    {/*            <TextField {...params} label="Rule Type" variant="standard"/>*/}
                    {/*        )}*/}
                    {/*    />*/}
                    {/*</Grid>*/}
                    <Grid item xs={6}>
                        <Autocomplete

                            fullWidth
                            size="small"
                            options={this.state.categories}
                            getOptionLabel={(option) => option.labelcategory}
                            value={this.state.category}
                            id="category"
                            clearOnEscape
                            onChange={(event, newValue) => this.handleChange("category", newValue)}
                            renderInput={(params) => (<TextField {...params} label="Category" variant="standard"/>)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete

                            fullWidth
                            size="small"
                            options={this.state.affixes}
                            getOptionLabel={(option) => option.labelaffix}
                            value={this.state.affix}
                            id="affix"
                            clearOnEscape
                            onChange={(event, newValue) => this.handleChange("affix", newValue)}
                            renderInput={(params) => (<TextField {...params} label="Affix" variant="standard"/>)}
                        />
                    </Grid>

                </Grid>
            </div>
            <br/>
            <div>{this.state.wflRelationCount > 0 ? "Total of wfl relations selected :" + this.state.wflRelationCount : ""}</div>
        </DialogContent>);
    }
}


export default WFLOptionDialog;
