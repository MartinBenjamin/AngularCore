using System.Collections.Generic;

namespace Ontology
{
    public class ObjectComplementOf:
        ClassExpression,
        IObjectComplementOf
    {
        private IClassExpression _classExpression;

        public ObjectComplementOf(
            IClassExpression classExpression
            )
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectComplementOf.ClassExpression => _classExpression;

        public override bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => !_classExpression.HasMember(
                classifications,
                individual);
    }
}
