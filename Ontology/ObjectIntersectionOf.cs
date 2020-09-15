using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectIntersectionOf: IObjectIntersectionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectIntersectionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectIntersectionOf.ClassExpressions => _classExpressions;

        bool IClassExpression.HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _classExpressions.All(classExpression => classExpression.HasMember(
                context,
                classifications,
                individual));
    }
}
