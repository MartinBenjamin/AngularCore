namespace Service.Model
{
    public class Currency: Named<string>
    {
        public int  NumericCode { get; set; }
        public int? MinorUnit   { get; set; }
    }
}
