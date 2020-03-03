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

        public static int LongestPath<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph,
            TVertex                                   vertex
            ) => graph.LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);

        public static IEnumerable<TVertex> TopologicalSort<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph
            ) => from vertex in graph.Keys
                orderby graph.LongestPath(
                    new Dictionary<TVertex, int>(),
                    vertex)
                select vertex;
              
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
