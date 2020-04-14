using Autofac;
using Iso3166._1;
using LegalEntities;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestLegalEntityController: TestNamedController<Guid, LegalEntity, NamedFilters, Web.Model.LegalEntity, NamedFilters, LegalEntityController>
    {
        private static Guid _legalEntityId = new Guid("FAB879AA-05FC-4881-9576-42FE0150D12D");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var legalEntity = session.Get<LegalEntity>(_legalEntityId);
                if(legalEntity != null)
                {
                    session.Delete(legalEntity.Country);
                    session.Delete(legalEntity);
                }

                session.Flush();
            }
        }

        public override LegalEntity Create(
            string name
            )
        {
            var country = new Country(
                "AA",
                "AAA",
                null,
                0,
                null);

            var legalEntity = new LegalEntity(
                _legalEntityId,
                name,
                null,
                country);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(legalEntity.Country);
                session.Save(legalEntity);
                session.Flush();
            }

            return legalEntity;
        }
    }
}
