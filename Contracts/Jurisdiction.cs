using CommonDomainObjects;
using Locations;
using System;

namespace Contracts
{
    public class Jurisdiction: Named<Guid>
    {
        public GeographicRegion Reach { get; protected set; }

        protected Jurisdiction(): base()
        {
        }

        public Jurisdiction(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
