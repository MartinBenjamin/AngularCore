using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private IList<IAxiom>               _axioms  = new List<IAxiom>();
        private IDictionary<string, IClass> _classes = new Dictionary<string, IClass>();
        private IDictionary<IClassExpression, HashSet<IClassExpression>>
                                            _superClasses = new Dictionary<IClassExpression, HashSet<IClassExpression>>();

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
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object lhs,
            object rhs
            )
        {
            var commonKeyedClassExpressions = ClassifyIndividual(
                classifications,
                lhs)
                .Where(classExpression => classExpression.Keys.Count > 0).ToHashSet();
            commonKeyedClassExpressions.IntersectWith(ClassifyIndividual(
                classifications,
                rhs));
            return
                commonKeyedClassExpressions.Count > 0 &&
                commonKeyedClassExpressions.All(classExpression => classExpression.Keys.All(hasKey => hasKey.AreEqual(lhs, rhs)));
        }

        public HashSet<IClassExpression> ClassifyIndividual(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            )
        {
            HashSet<IClassExpression> classExpressions;

            if(classifications.TryGetValue(
                individual,
                out classExpressions))
                return classExpressions;

            classifications[individual] =
            classExpressions = new HashSet<IClassExpression>();

            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    foreach(var @class in namedIndividual.Classes.Select(classAssertion => classAssertion.ClassExpression))
                        ClassifyIndividual(
                            classExpressions,
                            individual,
                            @class);
                    break;
                case IIndividual iindividual:
                    if(_classes.TryGetValue(iindividual.ClassName, out var @class1))
                        ClassifyIndividual(
                            classExpressions,
                            individual,
                            @class1);
                    break;
                default:
                    if(_classes.TryGetValue(individual.GetType().FullName, out var @class2))
                        ClassifyIndividual(
                            classExpressions,
                            individual,
                            @class2);
                    break;
            }

            foreach(var @class in _classes.Values.Where(@class => @class.Definition != null).Where(@class => @class.Definition.HasMember(
                classifications,
                individual)))
                ClassifyIndividual(
                    classExpressions,
                    individual,
                    @class);

            return classExpressions;
        }

        public void ClassifyIndividual(
            HashSet<IClassExpression> classExpressions,
            object                    individual,
            IClassExpression          classExpression
            )
        {
            if(!classExpressions.Add(classExpression))
                // Class Expression already processed.
                return;

            foreach(var superClassExpression in classExpression.SuperClasses.Select(superClass => superClass.SuperClassExpression))
                ClassifyIndividual(
                    classExpressions,
                    individual,
                    superClassExpression);

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                    ClassifyIndividual(
                        classExpressions,
                        individual,
                        componentClassExpression);
        }

        //public HashSet<IClassExpression> Classes(
        //    object individual
        //    )
        //{
        //    switch(individual)
        //    {
        //        case INamedIndividual namedIndividual:
        //            HashSet<IClassExpression> classExpressions = new HashSet<IClassExpression>();
        //            namedIndividual
        //                .Classes
        //                .Select(classAssertion => classAssertion.ClassExpression)
        //                .ForEach(classExpression => classExpressions.UnionWith(SuperClasses(classExpression)));
        //            return classExpressions;
        //        case IIndividual iindividual:
        //            if(_classes.TryGetValue(iindividual.ClassName, out var @class1))
        //                return SuperClasses(@class1);
        //            break;
        //        default:
        //            if(_classes.TryGetValue(individual.GetType().FullName, out var @class2))
        //                return SuperClasses(@class2);
        //            break;
        //    }
        //    return new HashSet<IClassExpression>();
        //}

        public HashSet<IClassExpression> SuperClasses(
            IClassExpression classExpression
            )
        {
            HashSet<IClassExpression> superClassExpressions;
            if(!_superClasses.TryGetValue(
                classExpression,
                out superClassExpressions))
            {
                superClassExpressions = new HashSet<IClassExpression>();
                _superClasses[classExpression] = superClassExpressions;
                superClassExpressions.Add(classExpression);

                foreach(var superClassExpression in classExpression.SuperClasses.Select(superClass => superClass.SuperClassExpression))
                    superClassExpressions.UnionWith(SuperClasses(superClassExpression));

                if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                    foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                        superClassExpressions.UnionWith(SuperClasses(componentClassExpression));
            }
            return superClassExpressions;
        }
    }
}
