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
            )
        {
            return graph.LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);
        }

        public static IEnumerable<TVertex> TopologicalSort<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> graph
            )
        {
            IDictionary<TVertex, int> longestPaths = new Dictionary<TVertex, int>();

            return
                from vertex in graph.Keys
                orderby graph.LongestPath(
                    longestPaths,
                    vertex)
                select vertex;
        }

        public static Graph<TVertex> ToGraph<TVertex>(
            this IDictionary<TVertex, IList<TVertex>> adjacencyList
            )
        {
            var graph = new Graph<TVertex>(Guid.Empty);
            var vertexMap = new Dictionary<TVertex, Vertex<TVertex>>();
            foreach(var vertex in adjacencyList.Keys)
                vertexMap[vertex] = new Vertex<TVertex>(
                    Guid.Empty,
                    graph,
                    vertex);
            foreach(var vertex in adjacencyList.Keys)
                foreach(var adjacentVertex in adjacencyList[vertex])
                    new Edge<TVertex>(
                        Guid.Empty,
                        graph,
                        vertexMap[vertex],
                        vertexMap[adjacentVertex]);
            return graph;
        }
    }
}
