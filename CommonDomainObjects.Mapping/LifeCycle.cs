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
                    listPropertiesMapper.Key(keyMapper => keyMapper.Column("LifeCycleId"));
                    listPropertiesMapper.Index(listIndexMapper => listIndexMapper.Column("StageIndex"));
                },
                collectionElementRelation => collectionElementRelation.ManyToMany(manyToManyMapper => manyToManyMapper.Column("LifeCycleStageId")));
        }
    }
}
