namespace Web.Model
{
    public class Named<TId>: DomainObject<TId>
    {
        public string Name        { get; set; }
        public int    NumericCode { get; set; }
        public int?   MinorUnit   { get; set; }
    }
}
