using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class HasKey: IHasKey
    {
        private IList<IDataPropertyExpression> _properties;

        IClassExpression IHasKey.ClassExpression => throw new NotImplementedException();

        IList<IDataPropertyExpression> IHasKey.Properties => throw new NotImplementedException();

        bool IHasKey.AreEqual(
            object lhs,
            object rhs
            )
        {
            // Assume max cardinality of 1.
            return (
                from property in _properties
                let lhsKeyValue = property.Values(lhs).FirstOrDefault()
                let rhsKeyValue = property.Values(rhs).FirstOrDefault()
                where object.Equals(lhsKeyValue, rhsKeyValue)
                select property).Count() == _properties.Count;
        }
    }
}
