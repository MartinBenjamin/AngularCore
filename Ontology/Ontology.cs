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
            var commonKeyedClassExpressions = Classes(lhs)
                .Where(classExpression => classExpression.Keys.Count > 0).ToHashSet();
            commonKeyedClassExpressions.IntersectWith(Classes(rhs));
            return
                commonKeyedClassExpressions.Count > 0 &&
                commonKeyedClassExpressions.All(classExpression => classExpression.Keys.All(hasKey => hasKey.AreEqual(lhs, rhs)));
        }

        public HashSet<IClassExpression> Classes(
            object individual
            )
        {
            var classExpressions = new HashSet<IClassExpression>();
            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    namedIndividual
                        .Classes
                        .Select(classAssertion => classAssertion.ClassExpression)
                        .ForEach(classExpression => classExpression.SuperClasses(classExpressions));
                    break;
                case IIndividual iindividual:
                    if(_classes.TryGetValue(iindividual.ClassName, out var @class1))
                        class1.SuperClasses(classExpressions);
                    break;
                case string className:
                    if(_classes.TryGetValue(className, out var @class2))
                        class2.SuperClasses(classExpressions);
                    break;
                default:
                    if(_classes.TryGetValue(individual.GetType().FullName, out var @class3))
                        class3.SuperClasses(classExpressions);
                    break;
            }
            return classExpressions;
        }
    }
}
