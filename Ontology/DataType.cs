using System;

namespace Ontology
{
    public class Datatype:
        Entity,
        IDatatype
    {
        public Datatype(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }

        bool IDataRange.HasMember(
            object value
            )
        {
            throw new NotImplementedException();
        }
    }

    public class Datatype<T>:
        BuiltIn,
        IDatatype
    {
        public Datatype(
            string prefixName,
            string localName
            ) : base(
                ReservedVocabulary.StandardPrefixNames[prefixName],
                localName)
        {
        }

        bool IDataRange.HasMember(
            object value
            )
        {
            return value is T;
        }
    }
}
