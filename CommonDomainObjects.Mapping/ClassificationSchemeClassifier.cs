using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class ClassificationSchemeClassifier: ClassMapping<CommonDomainObjects.ClassificationSchemeClassifier>
    {
        public ClassificationSchemeClassifier()
        {
            Bag(
                classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                collectionMapping =>
                {
                    collectionMapping.Key(keyMapping => keyMapping.Column("SuperId"));
                    collectionMapping.OrderBy("IntervalStart");
                });
        }
    }
}
