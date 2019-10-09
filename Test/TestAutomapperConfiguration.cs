using AutoMapper;
using NUnit.Framework;

namespace Test
{
    [TestFixture]
    public class TestAutomapperConfiguration
    {
        [Test]
        public void Test()
        {
            new MapperConfiguration(cfg => cfg.AddProfile(new Web.Profile())).AssertConfigurationIsValid();
        }
    }
}
