using System.Collections.Generic;

namespace Ontology
{
    public interface IDataIntersectionOf: IDataRange
    {
        IList<IDataRange> DataRanges { get; }
    }
}
