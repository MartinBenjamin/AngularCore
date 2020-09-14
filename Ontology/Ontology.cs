using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private IList<IOntology>            _imported;
        private IList<IAxiom>               _axioms  = new List<IAxiom>();
        private IDictionary<IClassExpression, HashSet<IClassExpression>>
                                            _superClasses = new Dictionary<IClassExpression, HashSet<IClassExpression>>();

        private IClass    _thing;
        private IClass    _nothing;
        private IDatatype _dateTime;

        public Ontology(
            params IOntology[] imported
            )
        {
            _imported = imported;
            _thing    = new Thing(this);
            _nothing  = new Nothing(this);
            _dateTime = new Datatype<DateTime>(this, "xsd:dateTime");
        }

        IList<IOntology> IOntology.Imported => _imported;

        IClassExpression IOntology.Thing => _thing;

        IClassExpression IOntology.Nothing => _nothing;

        IList<IAxiom> IOntology.Axioms => _axioms;

        IDatatype IOntology.DateTime => _dateTime;

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
                    this.GetClasses().Where(@class => @class.Name == iindividual.ClassName).ForEach(
                        @class => ClassifyIndividual(
                            classExpressions,
                            individual,
                            @class));
                    break;
                default:
                    this.GetClasses().Where(@class => @class.Name == individual.GetType().FullName).ForEach(
                        @class => ClassifyIndividual(
                            classExpressions,
                            individual,
                            @class));
                    break;
            }

            foreach(var @class in this.GetClasses().Where(@class => @class.Definition != null).Where(@class => @class.Definition.HasMember(
                classifications,
                individual)))
                ClassifyIndividual(
                    classExpressions,
                    individual,
                    @class);

            return classExpressions;
        }

        private void ClassifyIndividual(
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
