using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectUnionOf: IObjectUnionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectUnionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectUnionOf.ClassExpressions => _classExpressions;

        bool IClassExpression.HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _classExpressions.Any(classExpression => classExpression.HasMember(
                context,
                classifications,
                individual));
    }
}
