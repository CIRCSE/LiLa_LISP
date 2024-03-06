export const documentQuery = "PREFIX dc: <http://purl.org/dc/elements/1.1/>\n" +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    "PREFIX powla: <http://purl.org/powla/powla.owl#>\n" +
    "\n" +
    "SELECT ?id ?title WHERE {\n" +
    "  ?id ?pred powla:Document ;\n" +
    "  \t\tdc:title ?title\n" +
    "} order by ?title\n" +
    "\n";



export const corporaQuery = "PREFIX dc: <http://purl.org/dc/elements/1.1/>\n" +
    "prefix powla: <http://purl.org/powla/powla.owl#>\n" +
    "\n" +
    "# List all the corpora currently available in the LiLa Knowledge Base\n" +
    "SELECT ?id ?title\n" +
    "WHERE {\n" +
    "  ?id ?predicate powla:Corpus ;\n" +
    "           dc:title ?title\n" +
    "}order by ?title";

export const authorQuery =
    "Select ?author ?authorLabel {\n" +
    "  {\n" +
    "    SELECT distinct ?author\n" +
    "    WHERE {\n" +
    "      ?doc rdf:type powla:Document ;\n" +
    "               dcterms:creator ?author.\n" +
    "      {\n" +
    "      }\n" +
    "    } group by ?author\n" +
    "  }\n" +
    "  SERVICE <http://query.wikidata.org/sparql> {\n" +
    "    ?author rdfs:label ?authorLabel.\n" +
    "    FILTER (lang(?authorLabel) = 'en')\n" +
    "  }\n" +
    "} order by ?authorLabel";



