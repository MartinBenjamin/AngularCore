using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class DataOneOf: IDataOneOf
    {
        private IList<object> _values;

        public DataOneOf(
            params object[] values
            )
        {
            _values = values;
        }

        IList<object> IDataOneOf.Values => _values;

        bool IDataRange.HasMember(
            object value
            ) => _values.Any(value.Equals);
    }
}
