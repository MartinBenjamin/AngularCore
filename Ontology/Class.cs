using System.Collections.Generic;

namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        private IList<ISubClassOf> _superClasses = new List<ISubClassOf>();
        private IClassExpression   _definition;

        public Class(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        IList<ISubClassOf> IClassExpression.SuperClasses => _superClasses;

        public virtual bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _definition.HasMember(
                context,
                classifications,
                individual);

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
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            )
        {
            return context.ClassifyIndividual(
                classifications,
                individual).Contains(this);
        }
    }
}
