using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class DataIntersectionOf: IDataIntersectionOf
    {
        private readonly IList<IDataRange> _dataRanges;

        public DataIntersectionOf(
            params IDataRange[] dataRanges
            )
        {
            _dataRanges = dataRanges;
        }

        IList<IDataRange> IDataIntersectionOf.DataRanges => _dataRanges;

        bool IDataRange.HasMember(
            object value
            ) => _dataRanges.All(dataRange => dataRange.HasMember(value));
    }
}
