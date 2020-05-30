using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class DataUnionOf: IDataUnionOf
    {
        private IList<IDataRange> _dataRanges;

        public DataUnionOf(
            params IDataRange[] dataRanges
            )
        {
            _dataRanges = dataRanges;
        }

        IList<IDataRange> IDataUnionOf.DataRanges => _dataRanges;

        bool IDataRange.HasMember(
            object value
            ) => _dataRanges.Any(dataRange => dataRange.HasMember(value));
    }
}
