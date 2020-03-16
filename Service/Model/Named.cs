namespace Service.Model
{
    public class Named<TId>: DomainObject<TId>
    {
        public string Name { get; set; }
    }
}
