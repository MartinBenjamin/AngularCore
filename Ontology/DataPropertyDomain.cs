namespace Ontology
{
    public class DataPropertyDomain:
        DataPropertyAxiom,
        IDataPropertyDomain
    {
        private IClassExpression _domain;

        public DataPropertyDomain(
            IDataPropertyExpression dataPropertyExpression,
            IClassExpression        domain
            ) : base(dataPropertyExpression)
        {
            _domain = domain;
        }

        IClassExpression IDataPropertyDomain.Domain => _domain;
    }
}
