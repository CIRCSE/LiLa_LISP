// import $ from "jquery";
import * as Papa from 'papaparse';
import axios from "axios";
// import globals from "../Globals";



//const sparqlEndpoint = 'https://lila-erc.eu/sparql/lila_knowledge_base/query?format=csv&query='
//const sparqlEndpoint = 'http://lila-erc.eu:8080/fuseki/lila_knowledge_base/sparql'
// const sparqlEndpoint = 'http://localhost:8080/lila-lisp/Lisp_Sparql'


//prduction
const sparqlEndpoint = 'Lisp_Sparql'



// const sparqlEndpoint = 'http://localhost:8080/lila-lisp/Lisp_Sparql'

const usefullPrefix = "PREFIX marl: <http://www.gsi.dit.upm.es/ontologies/marl/ns#>\n" +
    "PREFIX powla: <http://purl.org/powla/powla.owl#>\n" +
    "PREFIX lexinfo: <https://lexinfo.net/ontology/2.0/lexinfo.owl#>\n" +
    "PREFIX lemonEty: <http://lari-datasets.ilc.cnr.it/lemonEty#>\n" +
    "PREFIX dcterms: <http://purl.org/dc/terms/>\n" +
    "PREFIX dc: <http://purl.org/dc/elements/1.1/>\n" +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX lila: <http://lila-erc.eu/ontologies/lila/>\n" +
    "PREFIX lime: <http://www.w3.org/ns/lemon/lime#>\n" +
    "PREFIX marl: <http://www.gsi.dit.upm.es/ontologies/marl/ns#>\n" +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n" +
    "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX premon: <http://premon.fbk.eu/ontology/core#>\n" +
    "PREFIX vallex: <http://lila-erc.eu/ontologies/latinVallex/>\n"


export function executeSparql(query, fields, callback) {

    let prefixedquery = usefullPrefix + "\n" + query
    console.log(prefixedquery);
    const formData = new FormData();
    formData.append('query', prefixedquery);
    formData.append('format', 'csv');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const instance = axios.create();
    instance.defaults.timeout = 60000;
    let prevTime = Date.now()
    instance.post(sparqlEndpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(function (response) {
        let results = Papa.parse(response.data, {header: true, skipEmptyLines: true});
        let curTime = Date.now()
        console.log("execution time:" + (curTime-prevTime));
        callback(results.data)
    }, (error) => {
        callback(null)
    })

}


export function queriesWrapper(queries, endFilterQuery,selectField, groupField) {
    let body = ""
    let pre = "select " + selectField + " where {\n"+
        "{select * where {\n"
    queries.forEach(query => {
        body += "\n{" + query + "}\n"
    })


    let end = "}\n}\n{"+ endFilterQuery + "}\n}" + groupField
    return pre + body + end

}

/*export function executeSparql(query, fields, callback) {
    let prefixedquery = usefullPrefix+"\n"+query
    $.ajax({
        url: sparqlEndpoint + encodeURIComponent(prefixedquery),
        async: true,
        type: "POST",
        dataType: "text",
        crossDomain: true,
        success: function (data) {
            let results = Papa.parse(data, {header: true, skipEmptyLines: true});
            callback(results.data)
        }

    });
}

*/
