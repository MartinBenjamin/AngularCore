using System;
using System.Collections.Generic;

namespace Web.Model
{
    public class LifeCycle: DomainObject<Guid>
    {
        public IList<LifeCycleStage> Stages { get; set; }
    }
}
