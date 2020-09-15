using System.Collections.Generic;

namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        private IList<ISubClassOf> _superClasses = new List<ISubClassOf>();

        protected ClassExpression() : base()
        {
        }

        IList<ISubClassOf> IClassExpression.SuperClasses => _superClasses;

        public abstract bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual);
    }
}
