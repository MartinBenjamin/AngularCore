interface IHierarchical<T>
{
    Parent  : Hierarchical<T>;
    Children: Hierarchical<T>[];
}

export type Hierarchical<T> = T & IHierarchical<T>;

export function Visit<T>(
    hierarchical: Hierarchical<T>,
    enter       : (hierarchical: Hierarchical<T>) => void,
    exit        : (hierarchical: Hierarchical<T>) => void = null
    ): void
{
    if(enter)
        enter(hierarchical);

    hierarchical.Children.forEach(
        child => Visit(
            child,
            enter,
            exit));

    if(exit)
        exit(hierarchical);
}

export function Filter<T>(
    hierarchical: Hierarchical<T>,
    filter      : (hierarchical: Hierarchical<T>) => boolean
    ): Hierarchical<T>[]
{
    let result: Hierarchical<T>[] = [];

    Visit(
        hierarchical,
        (hierarchical: Hierarchical<T>) =>
        {
            if(filter(hierarchical))
                result.push(hierarchical);
        });

    return result;
}