using System;
using System.Collections.Generic;

namespace Ontology
{
    public class ReservedVocabulary
    {
        public static readonly IDictionary<string, string> StandardPrefixNames = new Dictionary<string, string>
        {
            { "rdf" , "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
            { "rdfs", "http://www.w3.org/2000/01/rdf-schema#"       },
            { "xsd" , "http://www.w3.org/2001/XMLSchema#"           },
            { "owl" , "http://www.w3.org/2002/07/owl#"              }
        };

        public static IClass Thing   = new Thing();
        public static IClass Nothing = new Nothing();

        public static IDatatype DateTime = new Datatype<DateTime>("xsd", "dateTime");
    }
}
