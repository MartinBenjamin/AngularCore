using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class ClassificationSchemeClass: ClassMapping<CommonDomainObjects.ClassificationSchemeClass>
    {
        public ClassificationSchemeClass()
        {
            Bag(
                classificationSchemeClass => classificationSchemeClass.Sub,
                collectionMapping =>
                {
                    collectionMapping.Key(keyMapping => keyMapping.Column("SuperId"));
                    collectionMapping.OrderBy("IntervalStart");
                });

        }
    }
}
