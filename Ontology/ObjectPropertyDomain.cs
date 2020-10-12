namespace Ontology
{
    public class ObjectPropertyDomain:
        ObjectPropertyAxiom,
        IObjectPropertyDomain
    {
        private readonly IClassExpression _domain;

        public ObjectPropertyDomain(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          domain
            ) : base(objectPropertyExpression)
        {
            _domain = domain;
        }

        IClassExpression IObjectPropertyDomain.Domain => _domain;
    }
}
