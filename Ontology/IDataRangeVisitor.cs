namespace Ontology
{
    public interface IDataRangeVisitor<TResult>
    {
        TResult Visit(IDataComplementOf   dataComplementOf  );
        TResult Visit(IDataIntersectionOf dataIntersectionOf);
        TResult Visit(IDataOneOf          dataOneOf         );
        TResult Visit(IDataUnionOf        dataUnionOf       );
    }
}
