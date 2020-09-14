using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class HasKey:
        Axiom,
        IHasKey
    {
        private IClassExpression               _classExpression;
        private IList<IDataPropertyExpression> _properties;

        public HasKey(
            IOntology                        ontology,
            IClassExpression                 classExpression,
            params IDataPropertyExpression[] properties
            ) : base(ontology)
        {
            _classExpression = classExpression;
            _properties      = properties;
        }

        IClassExpression IHasKey.ClassExpression => _classExpression;

        IList<IDataPropertyExpression> IHasKey.Properties => _properties;

        bool IHasKey.AreEqual(
            object lhs,
            object rhs
            ) => _properties.All(property => property.AreEqual(lhs, rhs));
    }
}
