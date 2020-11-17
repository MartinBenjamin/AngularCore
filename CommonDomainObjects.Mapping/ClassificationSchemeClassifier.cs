using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class ClassificationSchemeClassifier: ClassMapping<CommonDomainObjects.ClassificationSchemeClassifier>
    {
        public ClassificationSchemeClassifier()
        {
            Bag(
                classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                bagPropertiesMapper =>
                {
                    bagPropertiesMapper.Key(keyMapper => keyMapper.Column("SuperId"));
                    bagPropertiesMapper.OrderBy("IntervalStart");
                });
        }
    }
}
