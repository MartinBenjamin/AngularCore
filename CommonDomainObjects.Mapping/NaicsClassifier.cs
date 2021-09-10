using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class NaicsClassifier: SubclassMapping<Naics.NaicsClassifier>
    {
        public NaicsClassifier()
        {
            Bag(
                naicsClassifier => naicsClassifier.CrossReferences,
                bagMapper => bagMapper.Table("NaicsClassifierCrossReference"),
                relation => relation.Element(
                    elementMapper => elementMapper.Column("CrossReference")));
        }
    }
}
