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
        where TEdge  : Edge <TVertex, TEdge>
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
        public virtual TVertex In  { get; protected set; }

        protected Edge(
            TVertex @out,
            TVertex @in
            )
        {
            Out = @out;
            In  = @in;
        }
    }

    public class Graph<TVertex>: Graph<Graph<TVertex>, TVertex, Edge<TVertex>>
    {
        public Graph() : base()
        {
        }
        
        public Graph(
            IList<TVertex>       vertices,
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
            object          vertex,
            HashSet<object> visited,
            Action<object>  action
            )
        {
            if(vertex == null || visited.Contains(vertex))
                return;

            action(vertex);

            visited.Add(vertex);

            (
                from type in vertex.GetTypes()
                join edge in Edges on type equals edge.Out
                from @in in edge.SelectIncoming(vertex)
                select @in
            ).ForEach(
                @in => Visit(
                    @in,
                    visited,
                    action));
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

        public abstract IEnumerable<object> SelectIncoming(object @out);
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

        public override IEnumerable<object> SelectIncoming(
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

        public override IEnumerable<object> SelectIncoming(
            object @out
            )
        {
            yield return _selectIncoming((TOut)@out);
        }
    }
}
