namespace Locations
{
    public abstract class GeographicSubregion: GeographicRegion
    {
        public virtual GeographicRegion Region { get; protected set; }

        protected GeographicSubregion() : base()
        {
        }

        protected GeographicSubregion(
            string           id,
            string           name,
            GeographicRegion region
            ) : base(
                id,
                name)
        {
            Region = region;
            Region?.Add(this);
        }
    }
}
