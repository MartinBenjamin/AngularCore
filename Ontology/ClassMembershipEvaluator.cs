﻿using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ClassMembershipEvaluator: IClassMembershipEvaluator
    {
        private IOntology                                      _ontology;
        private IDictionary<object, HashSet<IClassExpression>> _classifications;

        public ClassMembershipEvaluator(
            IOntology                                      ontology,
            IDictionary<object, HashSet<IClassExpression>> classifications
            )
        {
            _ontology        = ontology;
            _classifications = classifications;
        }

        bool IClassMembershipEvaluator.Evaluate(
            IClass @class,
            object individual
            ) => Classify(individual).Contains(@class);

        bool IClassMembershipEvaluator.Evaluate(
            IDataAllValuesFrom dataAllValuesFrom,
            object             individual
            ) => dataAllValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).All(dataAllValuesFrom.DataRange.HasMember);

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

        bool IClassMembershipEvaluator.Evaluate(
            IDataHasValue dataHasValue,
            object        individual
            ) => dataHasValue.DataPropertyExpression.Values(
                _ontology,
                individual).Contains(dataHasValue.Value);

        bool IClassMembershipEvaluator.Evaluate(
            IDataSomeValuesFrom dataSomeValuesFrom,
            object              individual
            ) => dataSomeValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).Any(dataSomeValuesFrom.DataRange.HasMember);

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
            IObjectMinCardinality objectMinCardinality,
            object                individual
            ) => objectMinCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMinCardinality.ClassExpression ?? _ontology.Thing).Evaluate(
                        this,
                        value)) >= objectMinCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectMaxCardinality objectMaxCardinality,
            object                individual
            ) => objectMaxCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMaxCardinality.ClassExpression ?? _ontology.Thing).Evaluate(
                        this,
                        value)) <= objectMaxCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectExactCardinality objectExactCardinality,
            object                  individual
            ) => objectExactCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectExactCardinality.ClassExpression ?? _ontology.Thing).Evaluate(
                        this,
                        value)) == objectExactCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectComplementOf objectComplementOf,
            object              individual
            ) => !objectComplementOf.ClassExpression.Evaluate(
                this,
                individual);

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
            IObjectIntersectionOf objectIntersectionOf,
            object                individual
            ) => objectIntersectionOf.ClassExpressions.All(classExpression => classExpression.Evaluate(
                this,
                individual));

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
            IObjectUnionOf objectUnionOf,
            object         individual
            ) => objectUnionOf.ClassExpressions.Any(classExpression => classExpression.Evaluate(
                this,
                individual));

        bool AreEqual(
            object lhs,
            object rhs
            )
        {
            var commonClassExpressions = Classify(lhs);
            commonClassExpressions.IntersectWith(Classify(rhs));
            var hasKeys =
                from commonClassExpression in commonClassExpressions
                from hasKey in _ontology.GetHasKeys(commonClassExpression)
                select hasKey;
            return
                hasKeys.Any() &&
                hasKeys.All(hasKey => hasKey.AreEqual(
                    _ontology,
                    lhs,
                    rhs));
        }

        public HashSet<IClassExpression> Classify(
            object individual
            )
        {
            HashSet<IClassExpression> classExpressions;

            if(_classifications.TryGetValue(
                individual,
                out classExpressions))
                return classExpressions;

            _classifications[individual] =
            classExpressions = new HashSet<IClassExpression>();

            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    _ontology.Get<IClassAssertion>()
                        .Where(classAssertion => classAssertion.NamedIndividual == namedIndividual)
                        .Select(classAssertion => classAssertion.ClassExpression)
                        .ForEach(classExpression => Classify(
                            classExpressions,
                            individual,
                            classExpression));
                    break;
                case IIndividual iindividual:
                    _ontology.Get<IClass>()
                        .Where(@class => @class.Name == iindividual.ClassName)
                        .ForEach(@class => Classify(
                            classExpressions,
                            individual,
                            @class));
                    break;
                default:
                    (
                        from @class in _ontology.Get<IClass>()
                        from type in individual.GetTypes()
                        where @class.Name == type.FullName
                        select @class
                    ).ForEach(@class => Classify(
                        classExpressions,
                        individual,
                        @class));
                    break;
            }

            (
                from eqivalentClasses in _ontology.Get<IEquivalentClasses>()
                from @class in eqivalentClasses.ClassExpressions.OfType<IClass>()
                let classExpression = eqivalentClasses.ClassExpressions.Where(classExpression => !(classExpression is IClass)).FirstOrDefault()
                where
                    classExpression != null &&
                    classExpression.Evaluate(
                        this,
                        individual)
                select @class
            ).ForEach(@class => Classify(
                classExpressions,
                individual,
                @class));

            return classExpressions;
        }

        private void Classify(
            HashSet<IClassExpression> classExpressions,
            object                    individual,
            IClassExpression          classExpression
            )
        {
            if(!classExpressions.Add(classExpression))
                // Class Expression already processed.
                return;

            foreach(var superClassExpression in _ontology.GetSuperClasses(classExpression).Select(superClass => superClass.SuperClassExpression))
                Classify(
                    classExpressions,
                    individual,
                    superClassExpression);

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                    Classify(
                        classExpressions,
                        individual,
                        componentClassExpression);
        }
    }
}