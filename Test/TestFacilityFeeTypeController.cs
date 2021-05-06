using Autofac;
using FacilityAgreements;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestFacilityFeeTypeController: TestNamedController<Guid, FacilityFeeType, NamedFilters, Web.Model.FacilityFeeType, NamedFilters, FacilityFeeTypeController>
    {
        private static Guid _facilityFeeTypeId = new Guid("ac1667cf-6ec9-4298-9698-6c8b12319867");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var facilityFeeType = session.Get<FacilityFeeType>(_facilityFeeTypeId);
                if(facilityFeeType != null)
                    session.Delete(facilityFeeType);

                session.Flush();
            }
        }

        public override FacilityFeeType Create(
            string name
            )
        {
            var facilityFeeType = new FacilityFeeType(
                _facilityFeeTypeId,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(facilityFeeType);
                session.Flush();
            }

            return facilityFeeType;
        }
    }
}
