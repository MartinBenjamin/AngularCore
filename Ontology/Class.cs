using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        private IList<ISubClassOf>               _superClasses     = new List<ISubClassOf>();
        private IList<IHasKey>                   _keys             = new List<IHasKey>();
        private IList<IObjectPropertyExpression> _objectProperties = new List<IObjectPropertyExpression>();
        private IList<IDataPropertyExpression>   _dataProperties   = new List<IDataPropertyExpression>();

        public Class(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
            ontology.Classes[_name] = this;
        }

        IList<ISubClassOf> IClassExpression.SuperClasses => _superClasses;

        IList<IHasKey> IClassExpression.Keys => _keys;

        IList<IObjectPropertyExpression> IClassExpression.ObjectProperties => _objectProperties;

        IList<IDataPropertyExpression> IClassExpression.DataProperties => _dataProperties;

        bool IClass.AreEqual(
            object lhs,
            object rhs
            )
        {
            return
                _keys.Count > 0 &&
                _keys.All(key => key.AreEqual(
                        lhs,
                        rhs));
        }

        public virtual bool HasMember(
            object individual
            ) => false;

        public override string ToString()
            => _name;
    }

    public class DomainObjectClass: Class
    {
        public DomainObjectClass(
            IOntology ontology,
            string    className
            ) : base(
                ontology,
                className)
        {
        }

        public override bool HasMember(
            object individual
            )
        {
            return ((DomainObject)individual).ClassName == _name;
        }
    }
}
