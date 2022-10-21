export function LongestPath<TVertex>(
    graph       : ReadonlyMap<TVertex, Iterable<TVertex>>,
    longestPaths: Map<TVertex, number>,
    vertex      : TVertex
    )
{
    if(!longestPaths.has(vertex))
    {
        let longestPath = 0;
        for(const adjacentVertex of graph.get(vertex))
            longestPath = Math.max(
                longestPath,
                LongestPath(
                    graph,
                    longestPaths,
                    adjacentVertex) + 1);
        longestPaths.set(
            vertex,
            longestPath);
    }

    return longestPaths.get(vertex);
}

export function LongestPaths<TVertex>(
    graph: ReadonlyMap<TVertex, Iterable<TVertex>>
    ): Map<TVertex, number>
{
    let longestPaths = new Map<TVertex, number>();
    for(const vertex of graph.keys())
        LongestPath(
            graph,
            longestPaths,
            vertex);
    return longestPaths;
}

export function TopologicalSort<TVertex>(
    graph: ReadonlyMap<TVertex, Iterable<TVertex>>
    ): Iterable<TVertex>
{
    let longestPaths = LongestPaths(graph);
    return [...graph.keys()].sort((a, b) => longestPaths.get(a) - longestPaths.get(b));
}
