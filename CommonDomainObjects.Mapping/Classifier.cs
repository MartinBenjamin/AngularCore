using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Classifier: ClassMapping<CommonDomainObjects.Classifier>
    {
        public Classifier()
        {
            Discriminator(
                discriminatorMapper =>
                {
                    discriminatorMapper.Column("Type");
                    discriminatorMapper.Length(50);
                });
        }
    }
}
