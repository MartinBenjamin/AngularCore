using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace LifeCycles
{
    public class LifeCycle: DomainObject<Guid>
    {
        public virtual IList<LifeCycleStage> Stages { get; protected set; }

        protected LifeCycle(): base()
        {
        }

        public LifeCycle(
            Guid                  id,
            IList<LifeCycleStage> stages
            ) : base(id)
        {
            Stages = stages;
        }
    }
}
