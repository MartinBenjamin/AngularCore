using System.Collections.Generic;

namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        private IList<ISubClassOf> _superClasses = new List<ISubClassOf>();
        private IList<IHasKey>     _keys         = new List<IHasKey>();

        protected ClassExpression():base()
        {
        }

        IList<ISubClassOf> IClassExpression.SuperClasses => _superClasses;

        IList<IHasKey> IClassExpression.Keys => _keys;

        public abstract bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual);
    }
}
