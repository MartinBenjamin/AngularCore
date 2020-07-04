using System;
using System.Collections.Generic;

namespace Web.Model
{
    public abstract class Hierarchy<TId, THierarchy, THierarchyMember, TMember>: DomainObject<TId>
        where THierarchy : Hierarchy<TId, THierarchy, THierarchyMember, TMember>
        where THierarchyMember : HierarchyMember<TId, THierarchy, THierarchyMember, TMember>
    {
        public IList<THierarchyMember> Members { get; set; }

        public Hierarchy() : base()
        {
        }
    }

    public abstract class HierarchyMember<TId, THierarchy, THierarchyMember, TMember>:
        DomainObject<TId>
        where THierarchy : Hierarchy<TId, THierarchy, THierarchyMember, TMember>
        where THierarchyMember : HierarchyMember<TId, THierarchy, THierarchyMember, TMember>
    {

        public TMember                  Member    { get; set; }
        public THierarchyMember         Parent    { get; set; }
        public  IList<THierarchyMember> Children  { get; set; }
        public Range<int>               Interval  { get; set; }


        public HierarchyMember() : base()
        {
        }
    }

    public class Hierarchy<TMember>: Hierarchy<Guid, Hierarchy<TMember>, HierarchyMember<TMember>, TMember>
    {
        public Hierarchy() : base()
        {
        }
    }

    public class HierarchyMember<TMember>: HierarchyMember<Guid, Hierarchy<TMember>, HierarchyMember<TMember>, TMember>
    {
        public HierarchyMember() : base()
        {
        }
    }
}
