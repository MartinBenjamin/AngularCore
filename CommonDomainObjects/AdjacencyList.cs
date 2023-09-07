using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public static class AdjacencyListExtensions
    {
        private static int LongestPath<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph,
            IDictionary<TVertex, int>                 longestPaths,
            TVertex                                   vertex
            )
        {
            if(!longestPaths.ContainsKey(vertex))
                longestPaths[vertex] = graph[vertex]
                    .Select(adjacentVertex => graph.LongestPath(
                        longestPaths,
                        adjacentVertex) + 1)
                    .Append(0)
                    .Max();

            return longestPaths[vertex];
        }

        private static int LongestPath<TVertex, TAdjacent>(
            this IDictionary<TVertex, TAdjacent> graph,
            IDictionary<TVertex, int>            longestPaths,
            TVertex                              vertex
            ) where TAdjacent: IEnumerable<TVertex>
        {
            if(!longestPaths.ContainsKey(vertex))
                longestPaths[vertex] = graph[vertex]
                    .Select(adjacentVertex => graph.LongestPath(
                        longestPaths,
                        adjacentVertex) + 1)
                    .Append(0)
                    .Max();

            return longestPaths[vertex];
        }

        public static int LongestPath<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph,
            TVertex                                   vertex
            ) => graph.LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);

        public static int LongestPath<TVertex, TAdjacent>(
            this IDictionary<TVertex, TAdjacent> graph,
            TVertex                              vertex
            ) where TAdjacent : IEnumerable<TVertex>
                => graph.LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);

        public static IEnumerable<TVertex> TopologicalSort<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph
            )
        {
            var longestPaths = new Dictionary<TVertex, int>();
            return
                from vertex in graph.Keys
                orderby graph.LongestPath(
                    longestPaths,
                    vertex)
                    select vertex;
        }

        public static IEnumerable<TVertex> TopologicalSort<TVertex, TAdjacent>(
            this IDictionary<TVertex, TAdjacent> graph
            ) where TAdjacent : IEnumerable<TVertex>
        {
            var longestPaths = new Dictionary<TVertex, int>();
            return
                from vertex in graph.Keys
                orderby graph.LongestPath(
                    longestPaths,
                    vertex)
                select vertex;
        }

        public static IDictionary<TVertex, IList<TVertex>> Transpose<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph
            ) => (
                from vertex in graph.Keys
                join edge in
                (
                    from @out in graph.Keys
                    from @in in graph[@out]
                    select (
                        Out: @out,
                        In : @in)
                )
                on vertex equals edge.In into edgesGroupedByIn
                select (
                    Out: vertex,
                    In : (IList<TVertex>)edgesGroupedByIn.Select(edge => edge.Out).ToList())
                ).ToDictionary(
                    tuple => tuple.Out,
                    tuple => tuple.In);

        public static IDictionary<TVertex, ISet<TVertex>> Transpose<TVertex>(
            this IDictionary<TVertex, ISet<TVertex>> graph
            ) => (
                from vertex in graph.Keys
                join edge in
                (
                    from @out in graph.Keys
                    from @in in graph[@out]
                    select (
                        Out: @out,
                        In: @in)
                )
                on vertex equals edge.In into edgesGroupedByIn
                select (
                    Out: vertex,
                    In: (ISet<TVertex>)edgesGroupedByIn.Select(edge => edge.Out).ToHashSet())
                ).ToDictionary(
                    tuple => tuple.Out,
                    tuple => tuple.In);

        public static IDictionary<V, IList<V>> Select<U, V>(
            this IDictionary<U, IList<U>> graph,
            Func<U, V>                    selector
            )
        {
            var map = graph.Keys.ToDictionary(
                vertex => vertex,
                vertex => selector(vertex));

            return graph.ToDictionary(
                    pair => map[pair.Key],
                    pair => (IList<V>)pair.Value.Select(adjacentVertex => map[adjacentVertex]).ToList());
        }

        public static Graph<TVertex> ToGraph<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> adjacencyList
            ) => new Graph<TVertex>(
                adjacencyList.Keys.ToList(),
                (
                    from @out in adjacencyList.Keys
                    from @in in adjacencyList[@out]
                    select new Edge<TVertex>(
                        @out,
                        @in)
                ).ToList());
    }
}
