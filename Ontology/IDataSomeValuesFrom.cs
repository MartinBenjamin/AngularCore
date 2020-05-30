namespace Ontology
{
    interface IDataSomeValuesFrom: IDataPropertyRestriction
    {
        IDataRange DataRange { get; }
    }
}
