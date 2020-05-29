namespace Ontology
{
    interface IDataSomeValuesFrom: IClassExpression
    {
        IDataPropertyExpression DataPropertyExpression { get; }
        IDataRange              DataRange              { get; }
    }
}
