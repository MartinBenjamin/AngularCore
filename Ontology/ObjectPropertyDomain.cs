namespace Ontology
{
    public class ObjectPropertyDomain:
        ObjectPropertyAxiom,
        IObjectPropertyDomain
    {
        private IClassExpression _domain;

        public ObjectPropertyDomain(
            IOntology                 ontology,
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          domain
            ) : base(
                ontology,
                objectPropertyExpression)
        {
            _domain = domain;
            _domain.ObjectProperties.Add(objectPropertyExpression);
        }

        IClassExpression IObjectPropertyDomain.Domain => _domain;
    }
}
