using CommonDomainObjects;

namespace Ontology
{
    public class ClassExpressionNavigator: IClassExpressionVisitor
    {
        private readonly IClassExpressionVisitor _enter;
        private readonly IClassExpressionVisitor _exit;

        public ClassExpressionNavigator(
            IClassExpressionVisitor enter,
            IClassExpressionVisitor exit = null
            )
        {
            _enter = enter;
            _exit  = exit;
        }

        void IClassExpressionVisitor.Visit(
            IClass @class
            )
        {
            _enter?.Visit(@class);
            _exit?.Visit(@class);
        }

        void IClassExpressionVisitor.Visit(
            IObjectIntersectionOf objectIntersectionOf
            )
        {
            _enter?.Visit(objectIntersectionOf);
            objectIntersectionOf.ClassExpressions.ForEach(classExpression => classExpression.Accept(this));
            _exit?.Visit(objectIntersectionOf);
        }

        void IClassExpressionVisitor.Visit(
            IObjectUnionOf objectUnionOf
            )
        {
            _enter?.Visit(objectUnionOf);
            objectUnionOf.ClassExpressions.ForEach(classExpression => classExpression.Accept(this));
            _exit?.Visit(objectUnionOf);
        }

        void IClassExpressionVisitor.Visit(
            IObjectComplementOf objectComplementOf
            )
        {
            _enter?.Visit(objectComplementOf);
            objectComplementOf.ClassExpression.Accept(this);
            _exit?.Visit(objectComplementOf);
        }

        void IClassExpressionVisitor.Visit(
            IObjectOneOf objectOneOf
            )
        {
            _enter?.Visit(objectOneOf);
            _exit?.Visit(objectOneOf);
        }

        void IClassExpressionVisitor.Visit(
            IObjectSomeValuesFrom objectSomeValuesFrom
            )
        {
            _enter?.Visit(objectSomeValuesFrom);
            objectSomeValuesFrom.ClassExpression.Accept(this);
            _exit?.Visit(objectSomeValuesFrom);
        }

        void IClassExpressionVisitor.Visit(
            IObjectAllValuesFrom objectAllValuesFrom
            )
        {
            _enter?.Visit(objectAllValuesFrom);
            objectAllValuesFrom.ClassExpression.Accept(this);
            _exit?.Visit(objectAllValuesFrom);
        }

        void IClassExpressionVisitor.Visit(
            IObjectHasValue objectHasValue
            )
        {
            _enter?.Visit(objectHasValue);
            _exit?.Visit(objectHasValue);
        }

        void IClassExpressionVisitor.Visit(
            IObjectMinCardinality objectMinCardinality
            )
        {
            _enter?.Visit(objectMinCardinality);
            objectMinCardinality.ClassExpression.Accept(this);
            _exit?.Visit(objectMinCardinality);
        }

        void IClassExpressionVisitor.Visit(
            IObjectMaxCardinality objectMaxCardinality
            )
        {
            _enter?.Visit(objectMaxCardinality);
            objectMaxCardinality.ClassExpression.Accept(this);
            _exit?.Visit(objectMaxCardinality);
        }

        void IClassExpressionVisitor.Visit(
            IObjectExactCardinality objectExactCardinality
            )
        {
            _enter?.Visit(objectExactCardinality);
            objectExactCardinality.ClassExpression.Accept(this);
            _exit?.Visit(objectExactCardinality);
        }

        void IClassExpressionVisitor.Visit(
            IDataSomeValuesFrom dataSomeValuesFrom
            )
        {
            _enter?.Visit(dataSomeValuesFrom);
            _exit?.Visit(dataSomeValuesFrom);
        }

        void IClassExpressionVisitor.Visit(
            IDataAllValuesFrom dataAllValuesFrom
            )
        {
            _enter?.Visit(dataAllValuesFrom);
            _exit?.Visit(dataAllValuesFrom);
        }

        void IClassExpressionVisitor.Visit(
            IDataHasValue dataHasValue
            )
        {
            _enter?.Visit(dataHasValue);
            _exit?.Visit(dataHasValue);
        }

        void IClassExpressionVisitor.Visit(
            IDataMinCardinality dataMinCardinality
            )
        {
            _enter?.Visit(dataMinCardinality);
            _exit?.Visit(dataMinCardinality);
        }

        void IClassExpressionVisitor.Visit(
            IDataMaxCardinality dataMaxCardinality
            )
        {
            _enter?.Visit(dataMaxCardinality);
            _exit?.Visit(dataMaxCardinality);
        }

        void IClassExpressionVisitor.Visit(
            IDataExactCardinality dataExactCardinality
            )
        {
            _enter?.Visit(dataExactCardinality);
            _exit?.Visit(dataExactCardinality);
        }
    }
}
