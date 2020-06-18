namespace Ontology
{
    public class DataPropertyDomain:
        DataPropertyAxiom,
        IDataPropertyDomain
    {
        private IClassExpression _domain;

        public DataPropertyDomain(
            IOntology               ontology,
            IDataPropertyExpression dataPropertyExpression,
            IClassExpression        domain
            ) : base(
                ontology,
                dataPropertyExpression)
        {
            _domain = domain;
            _domain.DataProperties.Add(dataPropertyExpression);
        }

        IClassExpression IDataPropertyDomain.Domain => _domain;
    }
}
