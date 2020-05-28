using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        private IList<IHasKey> _keys = new List<IHasKey>();

        public Class(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
            ontology.Classes[_name] = this;
        }

        IList<IHasKey> IClassExpression.Keys => _keys;

        bool IClass.AreEqual(
            object lhs,
            object rhs
            )
        {
            var hasKey = _keys.FirstOrDefault();
            return
                hasKey != null &&
                hasKey.AreEqual(
                    lhs,
                    rhs);
        }

        public virtual bool HasMember(
            object individual
            )
        {
            return false;
        }
    }

    public class Class<T>: Class
    {
        public Class(
            IOntology ontology
            ) : base(
                ontology,
                typeof(T).FullName)
        {
        }

        public override bool HasMember(
            object individual
            )
        {
            return individual.GetType() == typeof(T);
        }
    }
}
