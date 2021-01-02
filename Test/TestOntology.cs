using Autofac;
using CommonDomainObjects;
using Deals;
using NUnit.Framework;
using Ontology;
using Organisations;
using Parties;
using Roles;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    public class OntologyModule: Autofac.Module
    {
        public OntologyModule()
        {
        }

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder.RegisterType<Deals.CommonDomainObjects>().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Validation         >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Roles              >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.RoleIndividuals    >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Organisations      >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.LegalEntities      >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Parties            >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Deals              >().AsSelf().As<IOntology>().SingleInstance();
            builder.RegisterType<Deals.Advisory           >().AsSelf().As<IOntology>().As<IDealOntology>().SingleInstance();
            builder.RegisterType<Deals.ProjectFinance     >().AsSelf().As<IOntology>().As<IDealOntology>().SingleInstance();
        }
    }
    [TestFixture]
    public class TestOntology
    {
        private const string _listenerName = "TestListener";

        private IContainer                _container          ;
        private Deals.CommonDomainObjects _commonDomainObjects;
        private Deals.Validation          _validation         ;
        private Deals.Deals               _deals              ;
        private Deals.ProjectFinance      _projectFinance     ;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<OntologyModule>();

            _container = builder.Build();

            _commonDomainObjects = _container.Resolve<Deals.CommonDomainObjects>();
            _validation          = _container.Resolve<Deals.Validation         >();
            _deals               = _container.Resolve<Deals.Deals              >();
            _projectFinance      = _container.Resolve<Deals.ProjectFinance     >();
        }

        [SetUp]
        public void SetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        [Test]
        public void ToEnumerable()
        {
            Assert.That(((int?)null).ToEnumerable().Count(), Is.EqualTo(0));
            Assert.That(((int?)0).ToEnumerable().Count(), Is.EqualTo(1));
            Assert.That(0.ToEnumerable().Count(), Is.EqualTo(1));
            int? x = null;
            Assert.That(x, Is.Null);
            foreach(var y in ((int?)0).ToEnumerable())
                x = y;
            Assert.That(x, Is.Not.Null);
            Assert.That(x, Is.EqualTo(0));
            Assert.That((default(object)).ToEnumerable().Count(), Is.EqualTo(0));
        }

        [TestCase( 0, true)]
        [TestCase("", true)]
        public void TestThing(
            object individual,
            bool   result
            ) => Assert.That(ReservedVocabulary.Thing.Evaluate(
                null,
                individual),
                Is.EqualTo(result));

        [TestCase( 0, false)]
        [TestCase("", false)]
        public void TestNothing(
            object individual,
            bool   result
            ) => Assert.That(ReservedVocabulary.Nothing.Evaluate(
                null,
                individual),
                Is.EqualTo(result));

        [TestCase(null , false)]
        [TestCase(""   , false)]
        [TestCase("a"  , true )]
        [TestCase("ab" , true )]
        [TestCase("abc", true )]
        public void TestDealNameMandatory(
            string value,
            bool   result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                value,
                "Deals.Deal",
                null,
                null);

            var classifications = _deals.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            Assert.That(_deals.Validate(classifications)[deal][_commonDomainObjects.Name].Any(), Is.Not.EqualTo(result));
        }
       
        [TestCase(null, false)]
        [TestCase(0   ,  true)]
        [TestCase(1   ,  true)]
        [TestCase(2   ,  true)]
        [TestCase(3   ,  true)]
        public void TestSponsorEquityMandatory(
            decimal? equity,
            bool     result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "Deals.Deal",
                null,
                null);

            var sponsor = new Sponsor(
                null,
                new Role(
                    DealRoleIdentifier.Sponsor,
                    "Sponsor"),
                null,
                equity);

            deal.Parties.Add(sponsor);
            var classifications = _deals.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            Assert.That(classifications.ContainsKey(sponsor));
            classifications[sponsor].ForEach(TestContext.WriteLine);

            var errors = _deals.Validate(classifications);
            Assert.That(errors.ContainsKey(sponsor) && errors[sponsor][_deals.Equity].Any(), Is.Not.EqualTo(result));
        }

        [TestCase(0, false)]
        [TestCase(1, true )]
        [TestCase(2, true )]
        public void SponsorsMandatory(
            int  sponsorCount,
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance.Deal",
                null,
                null);

            var role = new Role(
                DealRoleIdentifier.Sponsor,
                null);
            Enumerable
                .Range(0, sponsorCount)
                .ForEach(i => deal.Parties.Add(new Sponsor(
                    Guid.NewGuid(),
                    null,
                    role,
                    null,
                    null)));

            var classifications = _projectFinance.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            Assert.That(_projectFinance.Validate(classifications)[deal][_deals.Sponsors].Any(), Is.Not.EqualTo(result));
        }

        [TestCase("ProjectFinance", 1, null)]
        [TestCase("Advisory"      , 0, 0   )]
        public void SponsorMultiplicity(
            string className,
            int?   start,
            int?   end
            )
        {
            var dealOntology = _container.Resolve<IEnumerable<IDealOntology>>().FirstOrDefault(o => o.Iri == className);
            Assert.IsNotNull(dealOntology);
            var classes = dealOntology.SuperClasses(dealOntology.Deal);

            var sponsorCardinality =
            (
                from objectCardinality in classes.OfType<IObjectCardinality>()
                where
                    objectCardinality.ObjectPropertyExpression == _deals.Sponsors
                select
                    objectCardinality is IObjectMinCardinality ?
                        new Range2<int>(objectCardinality.Cardinality, null) :
                        objectCardinality is IObjectMaxCardinality ?
                            new Range2<int>(0, objectCardinality.Cardinality) :
                            new Range2<int>(objectCardinality.Cardinality, objectCardinality.Cardinality)).FirstOrDefault();

            Assert.That(sponsorCardinality.Start, Is.EqualTo(start));
            Assert.That(sponsorCardinality.End  , Is.EqualTo(end  ));
        }

        [TestCase(0, false)]
        [TestCase(1, true )]
        [TestCase(2, true )]
        public void BorrowersMandatory(
            int  borrowerCount,
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "Deals.Debt",
                null,
                null);

            var role = new Role(
                DealRoleIdentifier.Borrower,
                null);
            Enumerable
                .Range(0, borrowerCount)
                .ForEach(i => deal.Parties.Add(new PartyInRole(
                    Guid.NewGuid(),
                    (Organisation)null,
                    role,
                    null)));

            var classifications = _deals.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            Assert.That(_deals.Validate(classifications)[deal][_deals.Borrowers].Any(), Is.Not.EqualTo(result));
        }

        [TestCase(false)]
        [TestCase(true )]
        public void ExclusiveDeal(
            bool result
            )
        {
            var exclusiveDeal = _deals.Get<IClass>().FirstOrDefault(@class => @class.LocalName == "ExclusiveDeal");

            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "Deals.Debt",
                null,
                null);

            deal.Classifiers.Add(new ExclusivityClassifier(
                result ? Guid.Empty : ExclusivityClassifierIdentifier.No,
                null));
            var classifications = _deals.Classify(deal);
            Assert.That(classifications[deal].Contains(exclusiveDeal), Is.EqualTo(result));
        }

        [TestCase(false)]
        [TestCase(true )]
        public void ExclusivityMandatory(
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "Deals.Debt",
                null,
                null);

            if(result)
                deal.Classifiers.Add(
                    new ExclusivityClassifier(
                        ExclusivityClassifierIdentifier.No,
                        string.Empty));

            var classifications = _deals.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            Assert.That(_deals.Validate(classifications)[deal][_deals.Exclusivity].Any(), Is.Not.EqualTo(result));
        }

        [Test]
        public void Exclusivity()
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "Deals.Debt",
                null,
                null);

            var exclusivity = new Exclusivity(
                Guid.NewGuid(),
                DateTime.Today);

            deal.Confers.Add(exclusivity);

            var classifications = _deals.Classify(deal);
            Assert.That(classifications.ContainsKey(exclusivity));
            classifications[exclusivity].ForEach(TestContext.WriteLine);

            var range =
            (
                from classExpression in classifications[exclusivity]
                join dataPropertyDomain in _deals.Get<IDataPropertyDomain>() on classExpression equals dataPropertyDomain.Domain
                join dataPropertyRange in _deals.Get<IDataPropertyRange>() on dataPropertyDomain.DataPropertyExpression equals dataPropertyRange.DataPropertyExpression
                from annotation in dataPropertyRange.Annotations
                where
                    annotation.Property == _validation.RangeValidated
                select dataPropertyRange
            ).FirstOrDefault();

            Assert.That(range, Is.Not.Null);
            Assert.That(range.DataPropertyExpression.LocalName, Is.EqualTo("Date"));
            Assert.That(range.Range, Is.EqualTo(ReservedVocabulary.DateTime));
        }
    }
}
