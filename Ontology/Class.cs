using System.Collections.Generic;

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
        private IClassExpression                 _definition;

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

        public virtual bool HasMember(
            object individual
            ) => _definition.HasMember(individual);

        IClassExpression IClass.Definition
        {
            get => _definition;
            set => _definition = value;
        }

        public override string ToString()
            => _name;
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
            return ((Ontology)_ontology).ClassifyIndividual(individual).Contains(this);
        }
    }
}
