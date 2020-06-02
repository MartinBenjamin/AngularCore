using System.Collections.Generic;

namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        private IList<ISubClassOf>               _superClasses     = new List<ISubClassOf>();
        private IList<IHasKey>                   _keys             = new List<IHasKey>();
        private IList<IObjectPropertyExpression> _objectProperties = new List<IObjectPropertyExpression>();
        private IList<IDataPropertyExpression>   _dataProperties   = new List<IDataPropertyExpression>();

        protected ClassExpression():base()
        {
        }

        IList<ISubClassOf> IClassExpression.SuperClasses => _superClasses;

        IList<IHasKey> IClassExpression.Keys => _keys;

        IList<IObjectPropertyExpression> IClassExpression.ObjectProperties => _objectProperties;

        IList<IDataPropertyExpression> IClassExpression.DataProperties => _dataProperties;

        public abstract bool HasMember(object individual);
    }
}
