using Iso3166._1;
using LegalEntities;
using NHibernate;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using System.Xml;

namespace Data
{
    public class LegalEntityLoader
    {
        private static readonly string _leiNamespace = "http://www.gleif.org/data/schema/leidata/2016";

        private readonly ISessionFactory _sessionfactory;
        private readonly int             _batchSize;

        public LegalEntityLoader(
            ISessionFactory sessionFactory,
            int             batchSize
            )
        {
            _sessionfactory = sessionFactory;
            _batchSize      = batchSize;
        }

        public async Task LoadAsync()
        {
            using(var zipFile = new FileStream(
                @"C:\Users\Martin\Downloads\20200118-gleif-concatenated-file-lei2.xml.5e22c9ddd878a.zip",
                FileMode.Open))
                using(var archive = new ZipArchive(
                    zipFile,
                    ZipArchiveMode.Read))
                    using(var stream = archive.Entries[0].Open())
                        using(var xmlReader = XmlReader.Create(
                            stream,
                            new XmlReaderSettings
                            {
                                Async = true
                            }))
                        {
                            if(await xmlReader.MoveToContentAsync() != XmlNodeType.Element)
                                return;

                            var batch = new List<LegalEntity>(_batchSize);

                            var count = 0;
                            while(count++ < 100)
                            {
                                batch.Clear();
                                using(var session = _sessionfactory.OpenSession())
                                using(var transaction = session.BeginTransaction())
                                {
                                    while(batch.Count < _batchSize)
                                    {
                                        if(xmlReader.ReadToFollowing(
                                            "LEIRecord",
                                            _leiNamespace))
                                        {
                                            xmlReader.ReadToFollowing(
                                                "LEI",
                                                _leiNamespace);
                                            var lei = await xmlReader.ReadElementContentAsStringAsync();

                                            xmlReader.ReadToFollowing(
                                                "LegalName",
                                                _leiNamespace);
                                            var legalName = await xmlReader.ReadElementContentAsStringAsync();

                                            xmlReader.ReadToFollowing(
                                                "LegalJurisdiction",
                                                _leiNamespace);
                                            var legalJurisdiction = xmlReader.ReadElementContentAsString();

                                            batch.Add(
                                                new LegalEntity(
                                                    Guid.NewGuid(),
                                                    legalName,
                                                    null,
                                                    session.Load<Country>(legalJurisdiction.Substring(0, 2))));
                                        }
                                    }

                                    foreach(var legalEntity in batch)
                                        await session.SaveAsync(legalEntity);

                                    if(batch.Count > 0)
                                        await transaction.CommitAsync();

                                    if(batch.Count < _batchSize)
                                        return;
                                }
                            }
                        }
        }
    }
}
