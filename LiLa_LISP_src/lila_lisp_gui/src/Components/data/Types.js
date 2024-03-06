
const types = {
  "authors": {
    "name": "authors",
    "generalOutgoingSPARQL": "SELECT  ?doc ?author\n" +
        "WHERE {\n" +
        "      injectValue\n" +
        "  ?doc rdf:type powla:Document ;\n" +
        "           dcterms:creator ?author.\n" +
        "  {\n" +
        "  }\n" +
        "} ",
    "generalSPARQL" : "select ?author ?authorLabel ?doc where{\n" +
        "      {\n" +
        "        SELECT  ?doc ?author \n" +

        "        WHERE {\n" +
        "      injectValue\n" +
        "          ?doc rdf:type powla:Document ;\n" +
        "               dcterms:creator ?author.\n" +
        "        } group by ?author\n" +
        "      }\n" +
        "      SERVICE <http://query.wikidata.org/sparql> {\n" +
        "        ?author rdfs:label ?authorLabel.\n" +
        "        FILTER (lang(?authorLabel) = 'en')\n" +
        "      }\n" +
        "    }",
    "text":"Authors",
    "color":"#bd9d19"
  },
  "corpora": {
    "name": "corpora",
    "generalOutgoingSPARQL": "select ?doc where{\n" +
        "      injectValue\n" +
        "      ?corpora powla:hasSubDocument ?doc;\n" +
        "               dc:title ?corporaTitle." +
        "    } ",
    "generalSPARQL":"select ?corpora ?corporaTitle ?doc where{\n" +
        "      injectValue\n" +
        "      ?corpora powla:hasSubDocument ?doc;\n" +
        "               dc:title ?corporaTitle." +
        "    }"
    ,
    "text":"Corpora",
    "color":"#bd7718"
  },
  "documents": {
    "name": "documents",
    "generalOutgoingSPARQL": "SELECT ?lemma ?doc WHERE {\n" +
        "      injectValue\n" +
        "  ?token lila:hasLemma ?lemma .\n" +
        "  ?token powla:hasLayer/powla:hasDocument ?doc.\n" +
        "  ?doc   dc:title ?docTitle\n" +
        "} group by  ?lemma ?doc ",
    "generalSPARQL":"  ?token lila:hasLemma ?lemma .\n" +
        "      injectValue\n" +
        "  ?token powla:hasLayer/powla:hasDocument ?doc.\n" +
        "  ?doc dc:title ?docTitle ."
    ,
    "text":"Documents",
    "color":"#8d4848"
  },
  "lemmabank": {
    "name": "lemmabank",
    "generalOutgoingSPARQL": "SELECT ?lemma  WHERE {\n" +
        "      injectValue\n" +
        "  VALUES ?lemmaType {\n" +
        "    lila:Lemma lila:Hypolemma\n" +
        "  }\n" +
        "?lemma rdf:type ?lemmaType ;\n" +
        "       rdfs:label ?lemmaLabel." +
        "} \n" +
        "",
    generalSPARQL: "SELECT ?lemma ?lemmaLabel  WHERE {\n" +
        "      injectValue\n" +
        "  VALUES ?lemmaType {\n" +
        "    lila:Lemma lila:Hypolemma\n" +
        "  }\n" +
        "?lemma rdf:type ?lemmaType ;\n" +
        "       rdfs:label ?lemmaLabel." +
        "}\n" +
        "",
    "text":"Lemma Bank",
    "color":"#824c66"
  },
  "wfl": {
    "name": "wfl",
    "generalOutgoingSPARQL": "select  ?lemma   where {\n" +
        "      injectValue\n" +
        "  <http://lila-erc.eu/data/lexicalResources/WFL/Lexicon> lime:entry ?le.\n" +
        "  ?category rdfs:subClassOf ?rule.\n" +
        "  ?rel <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflrelation;\n" +
        "       <http://www.w3.org/ns/lemon/vartrans#target> ?le.\n" +
        "  ?le ontolex:canonicalForm ?lemma.\n" +
        "  ?rule rdfs:subClassOf ?wflrule.\n" +
        "  ?category rdfs:subClassOf ?rule.\n" +
        "  ?wflrelation rdfs:label ?relLabel.\n" +
        "  ?wflrelation rdf:type ?category.\n" +
        "} group by ?lemma",
      generalSPARQL : "select distinct ?lemma ?wflrelation ?relLabel   where {\n" +
          "      injectValue\n" +
          "  <http://lila-erc.eu/data/lexicalResources/WFL/Lexicon> lime:entry ?le.\n" +
          "  ?category rdfs:subClassOf ?rule.\n" +
          "  ?rel <http://lila-erc.eu/ontologies/lila/wfl/hasWordFormationRule> ?wflrelation;\n" +
          "       <http://www.w3.org/ns/lemon/vartrans#target> ?le.\n" +
          "  ?le ontolex:canonicalForm ?lemma.\n" +
          "  ?rule rdfs:subClassOf ?wflrule.\n" +
          "  ?category rdfs:subClassOf ?rule.\n" +
          "  ?wflrelation rdfs:label ?relLabel.\n" +
          "  ?wflrelation rdf:type ?category.\n" +
          "} ",
    "text":"Word Formation Latin",
    "color":"#a789ab"
  },
  "affectus": {
    "name": "affectus",
    "generalOutgoingSPARQL": "SELECT ?lemma  WHERE {\n" +
        "      injectValue\n" +
        "  ?le ontolex:canonicalForm ?lemma ;\n" +
        "      ontolex:sense ?sense .\n" +
        "   ?lemma rdfs:label ?lemmaLabel.\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinAffectus/Lexicon> lime:entry  ?le.\n" +
        "  ?sense marl:hasPolarity ?polarity ;\n" +
        "         marl:polarityValue  ?v .\n" +
        "  BIND(REPLACE(STR(?polarity), \"http://www.gsi.dit.upm.es/ontologies/marl/ns#\", \"\") AS ?polarityString)\n" +
        "} group by ?lemma",
    generalSPARQL: "SELECT ?lemma ?lemmaLabelPolarity ?polarity ?polarityString WHERE {\n" +
        "      injectValue\n" +
        "  ?le ontolex:canonicalForm ?lemma ;\n" +
        "      ontolex:sense ?sense .\n" +
        "   ?lemma rdfs:label ?lemmaLabelPolarity.\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinAffectus/Lexicon> lime:entry  ?le.\n" +
        "  ?sense marl:hasPolarity ?polarity ;\n" +
        "         marl:polarityValue  ?v .\n" +
        "  BIND(REPLACE(STR(?polarity), \"http://www.gsi.dit.upm.es/ontologies/marl/ns#\", \"\") AS ?polarityString)\n" +
        "}",
    "text":"Latin Affectus",
    "color":"#6f5284"
  },
  "wordnet": {
    "name": "wordnet",
    "generalOutgoingSPARQL": "select  ?lemma  where {\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinWordNet/Lexicon> lime:entry ?le.\n" +
        "      injectValue\n" +
        "  ?le ontolex:evokes ?wnsyns;\n" +
        "      ontolex:canonicalForm ?lemma.\n" +
        "  ?wnsyns rdf:type ontolex:LexicalConcept;\n" +
        "          rdfs:label ?wnsysLabel;\n" +
        "          skos:definition ?wnsysDescription.\n" +
        "}group by ?lemma",
      "generalSPARQL": "select ?wnsyns ?lemma ?wnsysLabel ?wnsysDescription where {\n" +
          "  <http://lila-erc.eu/data/lexicalResources/LatinWordNet/Lexicon> lime:entry ?le.\n" +
          "      injectValue\n" +
          "  ?le ontolex:evokes ?wnsyns;\n" +
          "      ontolex:canonicalForm ?lemma.\n" +
          "  ?wnsyns rdf:type ontolex:LexicalConcept;\n" +
          "          rdfs:label ?wnsysLabel;\n" +
          "          skos:definition ?wnsysDescription.\n" +
          "}group by ?wnsyns",
    "text":"Latin Wordnet",
    "color":"#5f648e"
  },
  "igvll": {
    "name": "igvll",
    "generalOutgoingSPARQL": "",
    "text":"Index Graecorum Vocabulorum",
    "color":"#5a8793"
  },
  "brill": {
    "name": "brill",
    "generalOutgoingSPARQL": "",
    "text":"Brill",
    "color":"#83b08e"
  },
  "ls": {
    "name": "ls",
    "generalOutgoingSPARQL": "SELECT ?lemma WHERE {\n" +
        "      injectValue\n" +
        "  ?le ontolex:canonicalForm ?lemma ;\n" +
        "      ontolex:sense ?lc .\n" +
        "  \n" +
        "  ?lemma rdfs:label ?lemmaLabel.\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LewisShort/Lexicon> lime:entry  ?le.\n" +
        "  ?lc rdf:type ontolex:LexicalSense;\n" +
        "      <http://www.w3.org/2004/02/skos#definition> ?definition.\n" +
        "  \n" +
        "}group by ?lemma",
      "generalSPARQL": "SELECT ?lemma ?lc ?lemmaLabel ?definition WHERE {\n" +
          "      injectValue\n" +
          "  ?le ontolex:canonicalForm ?lemma ;\n" +
          "      ontolex:sense ?lc .\n" +
          "  \n" +
          "  ?lemma rdfs:label ?lemmaLabel.\n" +
          "  <http://lila-erc.eu/data/lexicalResources/LewisShort/Lexicon> lime:entry  ?le.\n" +
          "  ?lc rdf:type ontolex:LexicalSense;\n" +
          "      <http://www.w3.org/2004/02/skos#definition> ?definition.\n" +
          "  \n" +
          "}order by ?lemmaLabel ?lc ",
    "text":"Lewis & Short",
    "color":"#6b7d57"
  },
  "tokens": {
    "name": "tokens",
    "generalOutgoingSPARQL": "",
    "generalSPARQL":"?token lila:hasLemma ?lemma ;\n" +
        "           powla:hasLayer/powla:hasDocument ?doc;\n" +
        "           powla:hasStringValue ?tokenLabel." +
        "           ?doc   dc:title ?docTitle."
      ,
    "text":"Tokens",
    "color":"#0d7a66"
  },
  "vallex": {
    "name": "vallex",
    "generalOutgoingSPARQL": "select distinct ?wnsyns ?lemma (count (?vf) as ?wncount) where {\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinVallex/Lexicon> lime:entry ?le.\n" +
        "  ?le ontolex:evokes ?vf;\n" +
        "      ontolex:canonicalForm ?lemma.\n" +
        "  ?vconcept premon:evokedConcept ?vf.\n" +
        "  ?vf rdf:type vallex:ValencyFrame.\n" +
        "  \n" +
        "  ?mapping premon:item ?vconcept;\n" +
        "           premon:item ?wnconcept.\n" +
        "  ?wnconcept premon:evokedConcept ?wnsyns.\n" +
        "  ?le ontolex:evokes ?wnsyns.\n" +
        "  ?wnsyns rdf:type ontolex:LexicalConcept.\n" +
        "  \n" +
        "  injectValue\n" +
        "\n" +
        "} group by ?wnsyns ?vf ?lemma\n" +
        "injectHaving\n",
    "generalSPARQL":"select distinct ?wnsyns ?vf ?lemma ?lemmaLabel (count (?vf) as ?wncount) (group_concat(distinct ?functorLabel ; separator=\" \") as ?functors) where {\n" +
        "  <http://lila-erc.eu/data/lexicalResources/LatinVallex/Lexicon> lime:entry ?le.\n" +
        "  ?le ontolex:evokes ?vf;\n" +
        "      ontolex:canonicalForm ?lemma.\n" +
        "  ?lemma rdfs:label ?lemmaLabel.\n" +
        "  ?vconcept premon:evokedConcept ?vf.\n" +
        "  ?vf rdf:type vallex:ValencyFrame.\n" +
        " ?mapping premon:item ?vconcept;\n" +
        "           premon:item ?wnconcept.\n" +
        "  \t  ?wnconcept premon:evokedConcept ?wnsyns.\n" +
        "      ?wnsyns rdf:type ontolex:LexicalConcept.\n" +
        "  \n" +
        "  ?vf premon:semRole ?roles.\n" +
        "  ?roles vallex:functor ?f .\n" +
        "  ?f rdfs:label ?functorLabel.\n"+
        "  injectValue\n" +
        "\n" +
        "} group by ?wnsyns ?vf ?lemma ?lemmaLabel\n" +
        "injectHaving\n"
    ,
    "text":"Vallex",
    "color":"#00b29f"
  },
}

export default types
