using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Service
{
    public class ClassificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
    {
        protected readonly ISession _session;

        public ClassificationSchemeService(
            ISession session
            )
        {
            _session = session;
        }

        async Task<ClassificationScheme> IDomainObjectService<Guid, ClassificationScheme>.GetAsync(
            Guid id
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
            {
                _session
                    .CreateCriteria<ClassificationSchemeClassifier>()
                    .Fetch("Sub")
                    .Fetch("Classifier")
                    .CreateCriteria("ClassificationScheme")
                        .Add(Expression.Eq("Id", id))
                    .Future<ClassificationSchemeClassifier>();
                return await _session
                    .CreateCriteria<ClassificationScheme>()
                    .Add(Expression.Eq("Id", id))
                    .Fetch("Classifiers")
                    .FutureValue<ClassificationScheme>().GetValueAsync();
            }
        }
    }
}
