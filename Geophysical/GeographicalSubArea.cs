namespace Geophysical
{
    public abstract class GeographicalSubArea: GeographicalArea
    {
        public virtual GeographicalArea Area { get; protected set; }

        protected GeographicalSubArea() : base()
        {
        }

        protected GeographicalSubArea(
            string id,
            string name,
            GeographicalArea area
            ) : base(
                id,
                name)
        {
            Area = area;
            Area?.Add(this);
        }
    }
}
