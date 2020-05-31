using System.Collections.Generic;

namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        private IList<IHasKey> _keys = new List<IHasKey>();

        protected ClassExpression():base()
        {
        }

        IList<IHasKey> IClassExpression.Keys => _keys;

        public abstract bool HasMember(object individual);
    }
}
