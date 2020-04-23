using Autofac;
using Iso3166._1;
using LegalEntities;
using NHibernate;
using NUnit.Framework;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestLegalEntityService: TestNamedService<Guid, LegalEntity, NamedFilters>
    {
        private static Guid _legalEntityId = new Guid("fab879aa-05fc-4881-9576-42fe0150d12d");

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

        public override void Validate(
            LegalEntity legalEntity
            )
        {
            Assert.That(NHibernateUtil.IsInitialized(legalEntity.Country));
        }
    }
}
