using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class LifeCycle: ClassMapping<LifeCycles.LifeCycle>
    {
        public LifeCycle()
        {
            List(
                lifeCycle => lifeCycle.Stages,
                listPropertiesMapper =>
                {
                    listPropertiesMapper.Table("LifeCycleLifeCycleStage");
                    listPropertiesMapper.Index(
                        listIndexMapper =>
                        {
                        });

                    listPropertiesMapper.Key(
                    keyMapper =>
                    {
                    });

                });
        }
    }
}
