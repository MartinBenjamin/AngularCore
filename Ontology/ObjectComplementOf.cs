using System.Collections.Generic;

namespace Ontology
{
    public class ObjectComplementOf: IObjectComplementOf
    {
        private IClassExpression _classExpression;

        public ObjectComplementOf(
            IClassExpression classExpression
            )
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectComplementOf.ClassExpression => _classExpression;

        bool IClassExpression.HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => !_classExpression.HasMember(
                context,
                classifications,
                individual);
    }
}
