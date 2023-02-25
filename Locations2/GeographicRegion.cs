using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace Locations2
{
    public abstract class GeographicRegion: Named<string>
    {
        private IList<GeographicSubregion> _subregions;

        public virtual IReadOnlyList<GeographicSubregion> Subregions
            => new ReadOnlyCollection<GeographicSubregion>(_subregions);

        protected GeographicRegion() : base()
        {
        }

        protected GeographicRegion(
            string id,
            string name
            ) : base(
                id,
                name)
        {
            _subregions = new List<GeographicSubregion>();
        }

        public virtual void Visit(
            Action<GeographicRegion> enter,
            Action<GeographicRegion> exit = null
            )
        {
            enter?.Invoke(this);

            _subregions.ForEach(subregion => subregion.Visit(
                enter,
                exit));

            exit?.Invoke(this);
        }

        public virtual async Task VisitAsync(
            Func<GeographicRegion, Task> enter,
            Func<GeographicRegion, Task> exit = null
            )
        {
            if(enter != null)
                await enter(this);

            await _subregions.ForEachAsync(subregion => subregion.VisitAsync(
                enter,
                exit));

            if(exit != null)
                await exit(this);
        }
    }
}
