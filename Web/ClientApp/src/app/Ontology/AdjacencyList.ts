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

//export function TopologicalSort<TVertex, TAdjacent extends Iterable<TVertex>>(
//    graph: Map<TVertex, TAdjacent>
//    ): Iterable<TVertex>
//{
    
//    if(!longestPaths.has(vertex))
//    {
//        let longestPath = 0;
//        for(let adjacentVertex of graph.get(vertex))
//            longestPath = Math.max(
//                longestPath,
//                LongestPath(
//                    graph,
//                    longestPaths,
//                    adjacentVertex));
//        longestPaths.set(
//            vertex,
//            longestPath);
//    }

//    return longestPaths.get(vertex);

//}
//        public static int LongestPath<TVertex>(
//        this Map < TVertex, IList < TVertex >> graph,
//        TVertex                                   vertex
//    ) => graph.LongestPath(
//        new Dictionary<TVertex, int>(),
//        vertex);

//        public static int LongestPath<TVertex, TAdjacent>(
//            this Map < TVertex, TAdjacent > graph,
//            TVertex                              vertex
//        ) where TAdjacent: IEnumerable < TVertex >
//                => graph.LongestPath(
//            new Dictionary<TVertex, int>(),
//            vertex);

//        public static IEnumerable < TVertex > TopologicalSort<TVertex>(
//                this Map < TVertex, IList < TVertex >> graph
//            ) => from vertex in graph.Keys
//orderby graph.LongestPath(
//    new Dictionary<TVertex, int>(),
//    vertex)
//select vertex;

//        public static IEnumerable < TVertex > TopologicalSort<TVertex, TAdjacent>(
//    this Map < TVertex, TAdjacent > graph
//) where TAdjacent: IEnumerable < TVertex >
//                => from vertex in graph.Keys
//orderby graph.LongestPath(
//    new Dictionary<TVertex, int>(),
//    vertex)
//select vertex;
