using System.Collections.Generic;

namespace Ontology
{
    public class Class<T>:
        Entity,
        IClass
    {
        private IList<IHasKey> _keys;

        public Class(
            IOntology ontology
            ) : base(
                ontology,
                typeof(T).FullName)
        {
            ontology.Classes[_name] = this;
        }

        IList<IHasKey> IClassExpression.Keys => _keys;

        bool IClassExpression.HasMember(
            object individual
            )
        {
            return individual.GetType() == typeof(T);
        }
    }
}
