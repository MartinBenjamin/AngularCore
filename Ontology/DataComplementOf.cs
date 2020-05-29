namespace Ontology
{
    public class DataComplementOf: IDataComplementOf
    {
        private IDataRange _dataRange;

        public DataComplementOf(
            IDataRange dataRange
            )
        {
            _dataRange = dataRange;
        }

        IDataRange IDataComplementOf.DataRange => _dataRange;

        bool IDataRange.HasMember(
            object value
            ) => !_dataRange.HasMember(value);
    }
}
