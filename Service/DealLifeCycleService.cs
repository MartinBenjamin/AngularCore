using CommonDomainObjects;
using Deals;
using LifeCycles;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Service
{
    class DealLifeCycleService:
        DomainObjectService<Guid, LifeCycle>,
        IDealLifeCycleService
    {
        public DealLifeCycleService(
            ISession session
            ) : base(session)
        {
        }

        async Task<IList<LifeCycleStage>> IDealLifeCycleService.GetStages(
            Guid dealLifeCycleId,
            Guid phaseId
            )
        {
            using(var transaction = _session.BeginTransaction(IsolationLevel.ReadCommitted))
            {
                var dealLifeCycle                 = await _session.GetAsync<LifeCycle>(dealLifeCycleId);
                var dealStageClassificationScheme = await _session.GetAsync<ClassificationScheme>(ClassificationSchemeIdentifier.DealStage);
                var phaseLifeCycleStages = dealStageClassificationScheme[_session.Get<LifeCycleStage>(phaseId)].Sub.Select(sub => sub.Classifier);
                return dealLifeCycle.Stages
                    .Where(lifeCycleStage => phaseLifeCycleStages.Contains(lifeCycleStage))
                    .ToList();
            }
        }
    }
}
