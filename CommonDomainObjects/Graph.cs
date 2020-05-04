using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public interface IEdge<TVertex>
    {
        TVertex Out { get; }
        TVertex In  { get; }
    }

    public static class IEdgeExtensions
    {
        public static int LongestPath<TVertex>(
            this IEnumerable<IEdge<TVertex>> edges,
            IDictionary<TVertex, int>        longestPaths,
            TVertex                          vertex
            )
        {
            if(!longestPaths.ContainsKey(vertex))
                longestPaths[vertex] = (
                    from edge in edges
                    where edge.Out.Equals(vertex)
                    select edges.LongestPath(
                        longestPaths,
                        edge.In) + 1)
                    .Append(0)
                    .Max();

            return longestPaths[vertex];
        }

        public static IEnumerable<TVertex> TopologicalSort<TVertex>(
            this IEnumerable<IEdge<TVertex>> edges,
            IList<TVertex>                   vertices
            )
        {
            return
                from vertex in vertices
                orderby edges.LongestPath(
                    new Dictionary<TVertex, int>(),
                    vertex)
                select vertex;
        }
    }

    public abstract class Graph<TGraph, TVertex, TEdge>
        where TGraph : Graph<TGraph, TVertex, TEdge>
        where TEdge : Edge<TVertex, TEdge>
    {
        public virtual IList<TVertex> Vertices { get; protected set; }
        public virtual IList<TEdge>   Edges    { get; protected set; }

        protected Graph()
        {
            Vertices = new List<TVertex>();
            Edges    = new List<TEdge>();
        }

        protected Graph(
            IList<TVertex> vertices,
            IList<TEdge>   edges
            )
        {
            Vertices = vertices;
            Edges    = edges;
        }

        public virtual int LongestPath(
            TVertex vertex
            )
        {
            return Edges.LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);
        }

        public virtual IEnumerable<TVertex> TopologicalSort()
        {
            return Edges.TopologicalSort(Vertices);
        }
    }

    public abstract class Edge<TVertex, TEdge>: IEdge<TVertex>
        where TEdge : Edge<TVertex, TEdge>, IEdge<TVertex>
    {
        public virtual TVertex Out { get; protected set; }
        public virtual TVertex In { get; protected set; }

        protected Edge(
            TVertex @out,
            TVertex @in
            )
        {
            Out = @out;
            In = @in;
        }
    }

    public class Graph<TVertex>: Graph<Graph<TVertex>, TVertex, Edge<TVertex>>
    {
        public Graph() : base()
        {
        }

        public Graph(
            IList<TVertex> vertices,
            IList<Edge<TVertex>> edges
            ) : base(
                vertices,
                edges)
        {
        }
    }

    public class Edge<TVertex>: Edge<TVertex, Edge<TVertex>>
    {
        public Edge(
            TVertex @out,
            TVertex @in
            ) : base(
                @out,
                @in)
        {
        }
    }

    public static class TypeExtensions
    {
        public static IEnumerable<Type> GetTypes(
            this object obj
            )
        {
            var type = obj.GetType();
            while(type != null)
            {
                yield return type;
                type = type.BaseType;
            }
        }
    }

    public class Graph: Graph<Graph, Type, Edge>
    {
        public void Visit(
            object                       vertex,
            HashSet<object>              visited,
            Action<Type, object>         vertexAction,
            Action<Edge, object, object> edgeAction = null
            )
        {
            if(vertex == null || visited.Contains(vertex))
                return;

            visited.Add(vertex);

            vertex.GetTypes().ForEach(
                type =>
                {
                    vertexAction(
                        type,
                        vertex);

                    Edges.Where(edge => edge.Out == type).ForEach(
                        edge => edge.SelectIn(vertex).ForEach(
                            @in =>
                            {
                                edgeAction?.Invoke(
                                    edge,
                                    vertex,
                                    @in);

                                Visit(
                                    @in,
                                    visited,
                                    vertexAction,
                                    edgeAction);
                            }));
                });
        }

        public void Flatten(
            object                          root,
            out ILookup<Type, object>       vertexLookup,
            out ILookup<Edge, Edge<object>> edgeLookup
            )
        {
            var visited  = new HashSet<object>();
            var vertices = new List<(Type type, object vertex)>();
            var edges    = new List<(Edge edge, object @out, object @in)>();

            Visit(
                root,
                visited,
                (type, vertex) => vertices.Add((type, vertex)),
                (edge, @out, @in) => edges.Add((edge, @out, @in)));

            vertexLookup = vertices.ToLookup(
                tuple => tuple.type,
                tuple => tuple.vertex);

            edgeLookup = edges.ToLookup(
                tuple => tuple.edge,
                tuple => new Edge<object>(
                    tuple.@out,
                    tuple.@in));
        }
    }

    public abstract class Edge: Edge<Type, Edge>
    {
        public Edge(
            Type @out,
            Type @in
            ) : base(
                @out,
                @in)
        {
        }

        public abstract IEnumerable<object> SelectIn(object @out);
    }

    public class OneToManyEdge<TOut, TIn>: Edge
        where TIn : class
    {
        private Func<TOut, IEnumerable<TIn>> _selectIncoming;

        public OneToManyEdge(
            Func<TOut, IEnumerable<TIn>> selectIncoming
            ) : base(
                typeof(TOut),
                typeof(TIn))
        {
            _selectIncoming = selectIncoming;
        }

        public override IEnumerable<object> SelectIn(
            object @out
            )
        {
            return _selectIncoming((TOut)@out);
        }
    }

    public class ManyToOneEdge<TOut, TIn>: Edge
    {
        private Func<TOut, TIn> _selectIncoming;

        public ManyToOneEdge(
            Func<TOut, TIn> selectIncoming
            ) : base(
                typeof(TOut),
                typeof(TIn))
        {
            _selectIncoming = selectIncoming;
        }

        public override IEnumerable<object> SelectIn(
            object @out
            )
        {
            var @in = _selectIncoming((TOut)@out);
            if(@in != null)
                yield return @in;
        }
    }
}
