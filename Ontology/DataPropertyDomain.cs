namespace Ontology
{
    public class DataPropertyDomain:
        DataPropertyAxiom,
        IDataPropertyDomain
    {
        private readonly IClassExpression _domain;

        public DataPropertyDomain(
            IOntology               ontology,
            IDataPropertyExpression dataPropertyExpression,
            IClassExpression        domain
            ) : base(
                ontology,
                dataPropertyExpression)
        {
            _domain = domain;
        }

        IClassExpression IDataPropertyDomain.Domain => _domain;
    }
}
