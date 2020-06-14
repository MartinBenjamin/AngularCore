using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private IList<IAxiom>               _axioms  = new List<IAxiom>();
        private IDictionary<string, IClass> _classes = new Dictionary<string, IClass>();
        private IClass _thing;
        private IClass _nothing;

        public Ontology()
        {
            _thing   = new Thing(this);
            _nothing = new Nothing(this);
        }

        IClassExpression IOntology.Thing => _thing;

        IClassExpression IOntology.Nothing => _nothing;

        IList<IAxiom> IOntology.Axioms => _axioms;

        IDictionary<string, IClass> IOntology.Classes => _classes;


        bool IOntology.AreEqual(
            object lhs,
            object rhs
            )
        {
            var keyedClassExpressions = Classes(lhs)
                .Where(classExpression => classExpression.Keys.Count > 0).ToList();
            var commonKeyedClassExpressions = Classes(rhs);
            commonKeyedClassExpressions.IntersectWith(keyedClassExpressions);
            return commonKeyedClassExpressions.All(
                classExpression => classExpression.Keys.All(hasKey => hasKey.AreEqual(lhs, rhs)));
        }

        protected HashSet<IClassExpression> Classes(
            object individual
            )
        {
            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    var classExpressions = new HashSet<IClassExpression>();
                    namedIndividual
                        .Classes
                        .Select(classAssertion => classAssertion.ClassExpression)
                        .ForEach(classExpression => classExpression.SuperClasses(classExpressions));
                    return classExpressions;
                case DomainObject domainObject:
                    return _classes[domainObject.ClassName].SuperClasses();
                default:
                    return new HashSet<IClassExpression>();
            }
        }
    }
}
