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

export function TopologicalSort<TVertex, TAdjacent extends Iterable<TVertex>>(
    graph: Map<TVertex, TAdjacent>
    ): Iterable<TVertex>
{
    let longestPaths = new Map<TVertex, number>();
    return Array.from(graph.keys()).sort((
        a,
        b) => LongestPath(
            graph,
            longestPaths,
            b) - LongestPath(
                graph,
                longestPaths,
                a));
}
