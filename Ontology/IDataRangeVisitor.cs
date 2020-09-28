namespace Ontology
{
    public interface IDataRangeVisitor
    {
        void Visit(IDataComplementOf   dataComplementOf  );
        void Visit(IDataIntersectionOf dataIntersectionOf);
        void Visit(IDataOneOf          dataOneOf         );
        void Visit(IDataUnionOf        dataUnionOf       );
    }
}
