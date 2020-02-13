using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class TemporalObjectVersion<TObject>: ClassMapping<CommonDomainObjects.TemporalObjectVersion<TObject>>
    {
        public TemporalObjectVersion() : this(typeof(TObject).Name)
        {
        }

        public TemporalObjectVersion(
            string typeName = null
            )
        {
            Table((typeName ?? typeof(TObject).Name) + "Version");
        }
    }
}
