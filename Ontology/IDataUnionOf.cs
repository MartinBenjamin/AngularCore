using System.Collections.Generic;

namespace Ontology
{
    public interface IDataUnionOf: IDataRange
    {
        IList<IDataRange> DataRanges { get; }
    }
}
