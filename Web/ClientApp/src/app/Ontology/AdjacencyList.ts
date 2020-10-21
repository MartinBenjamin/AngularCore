export function LongestPath<TVertex, TAdjacent extends Iterable<TVertex>>(
    graph       : Map<TVertex, TAdjacent>,
    longestPaths: Map<TVertex, number>,
    vertex      : TVertex
    )
{
    if(!longestPaths.has(vertex))
    {
        let longestPath = 0;
        for(let adjacentVertex of graph.get(vertex))
            longestPath = Math.max(
                longestPath,
                LongestPath(
                    graph,
                    longestPaths,
                    adjacentVertex));
        longestPaths.set(
            vertex,
            longestPath);
    }

    return longestPaths.get(vertex);
}

export function LongestPaths<TVertex, TAdjacent extends Iterable<TVertex>>(
    graph: Map<TVertex, TAdjacent>
    ): Map<TVertex, number>
{
    let longestPaths = new Map<TVertex, number>();
    for(let vertex of graph.keys())
        LongestPath(
            graph,
            longestPaths,
            vertex);
    return longestPaths;
}

export function TopologicalSort<TVertex, TAdjacent extends Iterable<TVertex>>(
    graph: Map<TVertex, TAdjacent>
    ): Iterable<TVertex>
{
    let longestPaths = LongestPaths(graph);
    return Array.from(graph.keys()).sort(
        (a, b) => longestPaths.get(b) - longestPaths.get(a));
}
