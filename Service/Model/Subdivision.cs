namespace Service.Model
{
    public class Subdivision: GeographicalSubregion
    {
        public string Code              { get; set; }
        public string Country           { get; set; }
        public string ParentSubdivision { get; set; }
        public string Category          { get; set; }
    }
}
