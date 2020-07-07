import { DomainObject, Range } from "./CommonDomainObjects";

export interface Hierarchy<
    TId,
    THierarchy extends Hierarchy<TId, THierarchy, THierarchyMember, TMember>,
    THierarchyMember extends HierarchyMember<TId, THierarchy, THierarchyMember, TMember>,
    TMember> extends DomainObject<TId>
{
    Members: THierarchyMember[];
}

export interface HierarchyMember<
    TId,
    THierarchy extends Hierarchy<TId, THierarchy, THierarchyMember, TMember>,
    THierarchyMember extends HierarchyMember<TId, THierarchy, THierarchyMember, TMember>,
    TMember> extends DomainObject<TId>
{
    Member  : TMember;                  
    Parent  : THierarchyMember;         
    Children: THierarchyMember[]; 
    Interval: Range<number>;    
}
