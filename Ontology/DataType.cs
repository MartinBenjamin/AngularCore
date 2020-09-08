using System;

namespace Ontology
{
    public class DataType:
        Entity,
        IDataType
    {
        public DataType(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        bool IDataRange.HasMember(
            object value
            )
        {
            throw new NotImplementedException();
        }
    }
}
