using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    public class Vertex
    {
        public Position      Position { get; private set; }
        public int           Distance { get; private set; }
        public Vertex        Parent   { get; private set; }
        public IList<Vertex> Children { get; private set; } = new List<Vertex>();

        public Vertex(
            Vertex   parent,
            Position position
            )
        {
            Position = position;
            Parent   = parent;
            Distance = 1;
            if(Parent != null)
            {
                Parent.Children.Add(this);
                Distance = Parent.Distance + Distance;
            }
        }

        public void UpdateParent(
            Vertex parent
            )
        {
            Parent = parent;
            UpdateDistance();
        }

        void UpdateDistance()
        {
            Distance = Parent.Distance + 1;
            foreach(var child in Children)
                child.UpdateDistance();
        }
    }

    public struct Position
    {
        private static readonly (int, int)[] _increments = new (int, int)[]
        {
            (  1,  0 ),
            ( -1,  0 ),
            (  0,  1 ),
            (  0, -1 )
        };

    private IList<IList<int>> _map;

        public int Row    { get; private set; }
        public int Column { get; private set; }

        public Position(
            IList<IList<int>> map,
            int               row,
            int               column
            )
        {
            _map   = map;
            Row    = row;
            Column = column;
        }

        public IEnumerable<Position> NeighbouringVertices
        {
            get
            {
                var _this = this;
                return _increments
                    .Select(
                        increment => new Position(
                            _this._map,
                            _this.Row    + increment.Item1,
                            _this.Column + increment.Item2))
                    .Where(
                        position =>
                            position.Row    >= 0 &&
                            position.Row    < position._map.Count &&
                            position.Column >= 0 &&
                            position.Column < position._map[0].Count &&
                            position._map[position.Row][position.Column] == 0);
            }
        }

        public IEnumerable<Position> NeighbouringWalls
        {
            get
            {
                var _this = this;
                return _increments
                    .Select(
                        increment => new Position(
                            _this._map,
                            _this.Row    + increment.Item1,
                            _this.Column + increment.Item2))
                    .Where(
                        position =>
                            position.Row    >= 0 &&
                            position.Row    < position._map.Count &&
                            position.Column >= 0 &&
                            position.Column < position._map[0].Count &&
                            position._map[position.Row][position.Column] == 1);
            }
        }
    }

    [TestFixture]
    public class TestLevel3_2: Test
    {
        private int PathLength(
            IList<IList<int>> map
            )
        {
            // Generate shortest path tree for exit vertex.
            var exitShortestPathTreeVertices = new Vertex[
                map.Count,
                map[0].Count];
            var position = new Position(
                map,
                exitShortestPathTreeVertices.GetLength(0) - 1,
                exitShortestPathTreeVertices.GetLength(1) - 1);
            AddVertex(
                map,
                exitShortestPathTreeVertices,
                null,
                position);

            // Generate shortest path tree for entry vertex.
            var entryShortestPathTreeVertices = new Vertex[
                map.Count,
                map[0].Count];
            position = new Position(
                map,
                0,
                0);
            AddVertex(
                map,
                entryShortestPathTreeVertices,
                null,
                position);

            return FindShortest(
                map,
                exitShortestPathTreeVertices[map.Count - 1, map[0].Count - 1],
                exitShortestPathTreeVertices[0, 0].Distance,
                entryShortestPathTreeVertices);
        }

        void AddVertex(
            IList<IList<int>> map,
            Vertex[,]         vertices,
            Vertex            parent,
            Position          position
            )
        {
            var current = vertices[position.Row, position.Column] = new Vertex(
                parent,
                position);

            // Update neighbours in the shortest path tree.
            foreach(var neighbourPosition in position.NeighbouringVertices)
            {
                var neighbour = vertices[neighbourPosition.Row, neighbourPosition.Column];
                if(neighbour != null &&
                   neighbour.Distance > current.Distance + 1)
                    neighbour.UpdateParent(current);

            }

            /// Add neighbours not in the shortest path tree.
            foreach(var neighbourPosition in position.NeighbouringVertices)
                if(vertices[neighbourPosition.Row, neighbourPosition.Column] == null)
                    AddVertex(
                        map,
                        vertices,
                        current,
                        neighbourPosition);
        }

        private int FindShortest(
            IList<IList<int>> map,
            Vertex            vertex,
            int               distance,
            Vertex[,]         entryShortestPathTreeVertices
            )
        {
            // Locate neighbours over the wall.
            distance = vertex.Position.NeighbouringWalls
                .Select(
                    wallPosition =>
                    {
                        var neighbourRow    = 2 * wallPosition.Row    - vertex.Position.Row;
                        var neighbourColumn = 2 * wallPosition.Column - vertex.Position.Column;

                        if(neighbourRow >= 0 &&
                           neighbourRow < map.Count &&
                           neighbourColumn >= 0 &&
                           neighbourColumn < map[0].Count)
                            return entryShortestPathTreeVertices[neighbourRow, neighbourColumn];

                        return null;
                    }).Where(neighBourOverWall => neighBourOverWall != null)
                    .Aggregate(
                        distance,
                        (accumulator, neighbourOverWall) => Math.Min(
                            accumulator,
                            vertex.Distance + neighbourOverWall.Distance + 1));

            return vertex.Children
                .Select(child => FindShortest(
                    map,
                    child,
                    distance,
                    entryShortestPathTreeVertices))
                .Aggregate(
                    distance,
                    Math.Min);
        }

        [TestCaseSource("TestCases")]
        public void Test(
            IList<IList<int>> map,
            int               expectedLength
            )
        {
            Assert.That(PathLength(map), Is.EqualTo(expectedLength));
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                            new TestDataList<IList<int>>
                            {
                                new TestDataList<int>{0, 1},
                                new TestDataList<int>{0, 0}
                            },
                            3
                    },

                    new object[]
                    {
                            new TestDataList<IList<int>>
                            {
                                new TestDataList<int>{0, 0},
                                new TestDataList<int>{1, 0}
                            },
                            3
                    },

                    new object[]
                    {
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{0, 1, 1, 0},
                            new TestDataList<int>{0, 0, 0, 1},
                            new TestDataList<int>{1, 1, 0, 0},
                            new TestDataList<int>{1, 1, 1, 0}
                        },
                        7
                    },

                    new object[]
                    {
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{1, 1, 1, 1, 1, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 1, 1, 1, 1, 1},
                            new TestDataList<int>{0, 1, 1, 1, 1, 1},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0}
                        },
                        11
                    }
                };
            }
        }
    }
}
