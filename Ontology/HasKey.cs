using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class HasKey: IHasKey
    {
        private IClassExpression                         _classExpression;
        private IList<IFunctionalDataPropertyExpression> _properties;

        public HasKey(
            IClassExpression                           classExpression,
            params IFunctionalDataPropertyExpression[] properties
            )
        {
            _classExpression = classExpression;
            _properties      = properties;
            _classExpression.Keys.Add(this);
        }

        IClassExpression IHasKey.ClassExpression => _classExpression;

        IList<IFunctionalDataPropertyExpression> IHasKey.Properties => _properties;

        bool IHasKey.AreEqual(
            object lhs,
            object rhs
            ) => _properties.All(property => Equals(property.Value(lhs), property.Value(rhs)));
    }
}
