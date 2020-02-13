using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class TemporalObject<TObject>: ClassMapping<CommonDomainObjects.TemporalObject<TObject>>
    {
        public TemporalObject() : this(typeof(TObject).Name)
        {
        }

        public TemporalObject(
            string typeName = null
            )
        {
            Table((typeName ?? typeof(TObject).Name));
            List(
                temporalObject => temporalObject.Versions,
                collectionMapping => collectionMapping.Index(
                    listIndexMapping =>
                    {
                        listIndexMapping.Column("Number");
                        listIndexMapping.Base(1);
                    }));
        }
    }
}
