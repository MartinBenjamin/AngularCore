namespace Ontology
{
    public class ObjectPropertyDomain:
        ObjectPropertyAxiom,
        IObjectPropertyDomain
    {
        private readonly IClassExpression _domain;

        public ObjectPropertyDomain(
            IOntology                 ontology,
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          domain
            ) : base(
                ontology,
                objectPropertyExpression)
        {
            _domain = domain;
        }

        IClassExpression IObjectPropertyDomain.Domain => _domain;
    }
}
