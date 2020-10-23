import { Nothing } from "./Nothing";
import { Thing } from "./Thing";

let ReservedVocabulary = {

    StandardPrefixNames: {
        rdf : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        xsd : 'http://www.w3.org/2001/XMLSchema#',
        owl : 'http://www.w3.org/2002/07/owl#'
    },
    Thing  : null,
    Nothing: null
};

ReservedVocabulary.Thing   = new Thing();
ReservedVocabulary.Nothing = new Nothing();

export { ReservedVocabulary };
