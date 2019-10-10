namespace Web.Model
{
    public class Subdivision: GeographicalSubArea
    {
        public string Code              { get; set; }
        public string Country           { get; set; }
        public string ParentSubdivision { get; set; }
        public string Category          { get; set; }
    }
}
