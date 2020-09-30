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
        Entity,
        IDatatype
    {
        public Datatype(
            string localName
            ) : base(
                null,
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
