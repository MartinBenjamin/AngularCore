using System.Collections.Generic;

namespace Ontology
{
    public interface IDataOneOf: IDataRange
    {
        IList<object> Values { get; }
    }
}
