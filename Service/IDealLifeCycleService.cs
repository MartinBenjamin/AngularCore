using LifeCycles;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service
{
    public interface IDealLifeCycleService: IDomainObjectService<Guid, LifeCycle>
    {
        Task<IList<LifeCycleStage>> GetStagesAsync(
            Guid dealLifeCycleId,
            Guid phaseId);
    }
}
