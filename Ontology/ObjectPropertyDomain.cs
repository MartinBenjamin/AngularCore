namespace Ontology
{
    public class ObjectPropertyDomain:
        ObjectPropertyAxiom,
        IObjectPropertyDomain
    {
        private IClassExpression _domain;

        public ObjectPropertyDomain(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          domain
            ) : base(objectPropertyExpression)
        {
            _domain = domain;
            _domain.ObjectProperties.Add(objectPropertyExpression);
        }

        IClassExpression IObjectPropertyDomain.Domain => _domain;
    }
}
