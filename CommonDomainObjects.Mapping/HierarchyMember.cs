using NHibernate.Mapping.ByCode.Conformist;
using System;

namespace CommonDomainObjects.Mapping
{
    public class HierarchyMember<TId, THierarchy, THierarchyMember, TMember>: ClassMapping<THierarchyMember>
        where THierarchy : Hierarchy<TId, THierarchy, THierarchyMember, TMember>
        where THierarchyMember : CommonDomainObjects.HierarchyMember<TId, THierarchy, THierarchyMember, TMember>
        where TMember: class
    {
        public HierarchyMember()
        {
            Bag(
                hierarchyMember => hierarchyMember.Children,
                bagPropertiesMapper => bagPropertiesMapper.Key(keyMapper => keyMapper.Column("ParentId")));

            ManyToOne(
                hierarchyMember => hierarchyMember.Hierarchy,
                manyToOneMapper => manyToOneMapper.ForeignKey("FK_" + typeof(THierarchyMember).Name + "_Hierarchy"));

            ManyToOne(
                hierarchyMember => hierarchyMember.Member,
                manyToOneMapper => manyToOneMapper.ForeignKey("FK_" + typeof(THierarchyMember).Name + "_Member"));

            ManyToOne(
                hierarchyMember => hierarchyMember.Parent,
                manyToOneMapper => manyToOneMapper.ForeignKey("FK_" + typeof(THierarchyMember).Name + "_Parent"));
        }
    }

    public class HierarchyMember: HierarchyMember<
        Guid,
        Organisations.Hierarchy,
        Organisations.HierarchyMember,
        Organisations.Organisation>
    {
        public HierarchyMember() : base()
        {
        }
    }
}
