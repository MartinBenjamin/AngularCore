using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ClassMembershipEvaluator: IClassMembershipEvaluator
    {
        private readonly IOntology                                   _ontology;
        private readonly IDictionary<IClass, IClassExpression>       _classDefinitions;
        private readonly IList<IClass>                               _definedClasses;
        private readonly IDictionary<string, IClass>                 _classes;
        private readonly ILookup<INamedIndividual, IClassExpression> _classAssertions;
        private readonly ILookup<IClassExpression, IClassExpression> _superClassExpressions;
        private readonly ILookup<IClassExpression, IClassExpression> _subClassExpressions;
        private readonly ILookup<IClassExpression, IClassExpression> _disjointClassExpressions;
        private readonly IDictionary<object, ISet<IClassExpression>> _classifications;

        private class ClassVisitor: ClassExpressionVisitor
        {
            private readonly Action<IClass> _action;

            public ClassVisitor(
                Action<IClass> action
                )
            {
                _action = action;
            }

            public override void Visit(
                IClass @class
                ) => _action(@class);
        }

        private struct ClassComparer: IComparer<IClass>
        {
            private readonly IDictionary<IClass, int> _longestPaths;

            public ClassComparer(
                IDictionary<IClass, int> longestPaths
                )
            {
                _longestPaths = longestPaths;
            }

            int IComparer<IClass>.Compare(
                IClass x,
                IClass y) => _longestPaths[x].CompareTo(_longestPaths[y]);
        }

        public ClassMembershipEvaluator(
            IOntology                                   ontology,
            IDictionary<object, ISet<IClassExpression>> classifications
            )
        {
            _ontology              = ontology;
            _classifications       = classifications;
            _classes = _ontology.Get<IClass>().ToDictionary(
                @class => @class.Iri);
            _classAssertions       = _ontology.Get<IClassAssertion>().ToLookup(
                classAssertion => classAssertion.NamedIndividual,
                classAssertion => classAssertion.ClassExpression);
            _superClassExpressions = _ontology.Get<ISubClassOf>().ToLookup(
                subClassOf => subClassOf.SubClassExpression,
                subClassOf => subClassOf.SuperClassExpression);
            _subClassExpressions   = _ontology.Get<ISubClassOf>().ToLookup(
                subClassOf => subClassOf.SuperClassExpression,
                subClassOf => subClassOf.SubClassExpression);
            _classDefinitions      = (
                from @class in _ontology.Get<IClass>()
                from equivalentClasses in _ontology.Get<IEquivalentClasses>()
                where equivalentClasses.ClassExpressions.Contains(@class)
                from classExpression in equivalentClasses.ClassExpressions
                where !(classExpression is IClass)
                group classExpression by @class into classExpressionsGroupedbyClass
                select
                (
                    Class          : classExpressionsGroupedbyClass.Key,
                    ClassExpression: classExpressionsGroupedbyClass.First()
                )).ToDictionary(
                    definition => definition.Class,
                    definition => definition.ClassExpression);

            var disjointPairs = (
                from disjointClasses in _ontology.Get<IDisjointClasses>()
                from ClassExpression1 in disjointClasses.ClassExpressions
                from ClassExpression2 in disjointClasses.ClassExpressions
                where ClassExpression1 != ClassExpression2
                select
                (
                    ClassExpression1,
                    ClassExpression2
                )).ToList();

            for(var index = 0;index < disjointPairs.Count;++index)
            {
                var (ClassExpression1, ClassExpression2) = disjointPairs[index];
                _subClassExpressions[ClassExpression2].ForEach(
                    subclassExpression => disjointPairs.Add(
                        (
                            ClassExpression1,
                            ClassExpression2: subclassExpression
                        )));
            }

            _disjointClassExpressions = disjointPairs.ToLookup(
                disjointPair => disjointPair.ClassExpression1,
                disjointPair => disjointPair.ClassExpression2);

            HashSet<IClass> adjacent = null;
            var empty = new HashSet<IClass>();
            var adjacencyList = _ontology.Get<IClass>()
                .ToDictionary(
                    @class => @class,
                    @class => empty);

            var classVisitor = new ClassExpressionNavigator(new ClassVisitor(@class => adjacent.Add(@class)));

            _classDefinitions.ForEach(
                pair =>
                {
                    adjacent = new HashSet<IClass>();
                    pair.Value.Accept(classVisitor);
                    adjacencyList[pair.Key] = adjacent;
                });

            _definedClasses = (
                from @class in adjacencyList.TopologicalSort()
                join definition in _classDefinitions on @class equals definition.Key
                select definition.Key
                ).ToList();
        }

        bool IClassMembershipEvaluator.Evaluate(
            IClass @class,
            object individual
            ) => Classify(individual).Contains(@class);

        bool IClassMembershipEvaluator.Evaluate(
            IObjectIntersectionOf objectIntersectionOf,
            object                individual
            ) => objectIntersectionOf.ClassExpressions.All(classExpression => classExpression.Evaluate(
                this,
                individual));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectUnionOf objectUnionOf,
            object         individual
            ) => objectUnionOf.ClassExpressions.Any(classExpression => classExpression.Evaluate(
                this,
                individual));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectComplementOf objectComplementOf,
            object              individual
            ) => !objectComplementOf.ClassExpression.Evaluate(
                this,
                individual);

        bool IClassMembershipEvaluator.Evaluate(
            IObjectOneOf objectOneOf,
            object       individual
            ) => objectOneOf.Individuals.Any(
                member => AreEqual(
                    individual,
                    member));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectSomeValuesFrom objectSomeValuesFrom,
            object                individual
            ) => objectSomeValuesFrom.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => objectSomeValuesFrom.ClassExpression.Evaluate(
                        this,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectAllValuesFrom objectAllValuesFrom,
            object               individual
            ) => objectAllValuesFrom.ObjectPropertyExpression.Values(
                _ontology,
                individual).All(
                    value => objectAllValuesFrom.ClassExpression.Evaluate(
                        this,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectHasValue objectHasValue,
            object          individual
            ) => objectHasValue.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => AreEqual(
                        objectHasValue.Individual,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectHasSelf objectHasValue,
            object         individual
            ) => objectHasValue.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => AreEqual(
                        individual,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectMinCardinality objectMinCardinality,
            object                individual
            ) => objectMinCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMinCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) >= objectMinCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectMaxCardinality objectMaxCardinality,
            object                individual
            ) => objectMaxCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMaxCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) <= objectMaxCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectExactCardinality objectExactCardinality,
            object                  individual
            ) => objectExactCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectExactCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) == objectExactCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataSomeValuesFrom dataSomeValuesFrom,
            object              individual
            ) => dataSomeValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).Any(dataSomeValuesFrom.DataRange.HasMember);

        bool IClassMembershipEvaluator.Evaluate(
            IDataAllValuesFrom dataAllValuesFrom,
            object             individual
            ) => dataAllValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).All(dataAllValuesFrom.DataRange.HasMember);

        bool IClassMembershipEvaluator.Evaluate(
            IDataHasValue dataHasValue,
            object        individual
            ) => dataHasValue.DataPropertyExpression.Values(
                _ontology,
                individual).Contains(dataHasValue.Value);

        bool IClassMembershipEvaluator.Evaluate(
            IDataMinCardinality dataMinCardinality,
            object              individual
            ) => dataMinCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataMinCardinality.DataRange?.HasMember(value) ?? true) >= dataMinCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataMaxCardinality dataMaxCardinality,
            object              individual
            ) => dataMaxCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataMaxCardinality.DataRange?.HasMember(value) ?? true) <= dataMaxCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataExactCardinality dataExactCardinality,
            object                individual
            ) => dataExactCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataExactCardinality.DataRange?.HasMember(value) ?? true) == dataExactCardinality.Cardinality;

        private bool AreEqual(
            object lhs,
            object rhs
            )
        {
            var commonClassExpressions = Classify(lhs);
            commonClassExpressions.IntersectWith(Classify(rhs));
            var hasKeys =
                from commonClassExpression in commonClassExpressions
                join hasKey in _ontology.Get<IHasKey>() on commonClassExpression equals hasKey.ClassExpression
                select hasKey;
            return
                hasKeys.Any() &&
                hasKeys.All(hasKey => hasKey.AreEqual(
                    _ontology,
                    lhs,
                    rhs));
        }

        public ISet<IClassExpression> Classify(
            object individual
            )
        {
            if(_classifications.TryGetValue(
                individual,
                out ISet<IClassExpression> classExpressions))
                return classExpressions;

            _classifications[individual] = classExpressions = new HashSet<IClassExpression>();
            var candidates = _definedClasses.ToHashSet();

            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    _classAssertions[namedIndividual].ForEach(classExpression => Classify(
                            classExpressions,
                            candidates,
                            individual,
                            classExpression));
                    break;
                case IIndividual iindividual:
                    if(_classes.TryGetValue(
                        iindividual.ClassIri,
                        out IClass @class))
                        Classify(
                            classExpressions,
                            candidates,
                            individual,
                            @class);
                    break;
                default:
                    (
                        from @class1 in _classes.Values
                        join type in individual.GetTypes() on @class1.Iri equals type.FullName
                        select @class1
                    ).ForEach(@class1 => Classify(
                        classExpressions,
                        candidates,
                        individual,
                        @class1));
                    break;
            }

            foreach(var definedClass in _definedClasses)
                if(candidates.Contains(definedClass) &&
                   _classDefinitions[definedClass].Evaluate(
                    this,
                    individual))
                    Classify(
                        classExpressions,
                        candidates,
                        individual,
                        definedClass);

            return classExpressions;
        }

        private void Classify(
            ISet<IClassExpression> classExpressions,
            ISet<IClass>           candidates,
            object                 individual,
            IClassExpression       classExpression
            )
        {
            if(!classExpressions.Add(classExpression))
                // Class Expression already processed.
                return;

            // Prune candidates.
            if(classExpression is IClass @class)
                candidates.Remove(@class);
            candidates.ExceptWith(_disjointClassExpressions[classExpression].OfType<IClass>());

            _superClassExpressions[classExpression].ForEach(superClassExpression => Classify(
                    classExpressions,
                    candidates,
                    individual,
                    superClassExpression));

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                objectIntersectionOf.ClassExpressions
                    .ForEach(componentClassExpression => Classify(
                        classExpressions,
                        candidates,
                        individual,
                        componentClassExpression));
        }
    }
}
