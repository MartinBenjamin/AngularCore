using NUnit.Framework;
using System;
using System.Collections.Generic;
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

        public IEnumerable<Position> Neighbours
        {
            get
            {
                var increments = new (int, int)[]
                {
                    ( 1,  0),
                    (-1,  0),
                    ( 0,  1),
                    ( 0, -1)
                };

                foreach(var increment in increments)
                {
                    var neighbourRow    = Row    + increment.Item1;
                    var neighbourColumn = Column + increment.Item2;
                    if(neighbourRow >= 0 &&
                       neighbourRow < _map.Count &&
                       neighbourColumn >= 0 &&
                       neighbourColumn < _map[0].Count &&
                       _map[neighbourRow][neighbourColumn] == 0)
                       yield return new Position(_map, neighbourRow, neighbourColumn);
                }
            }
        }
        public IEnumerable<Position> SurroundingWalls
        {
            get
            {
                var increments = new (int, int)[]
                {
                    ( 1,  0),
                    (-1,  0),
                    ( 0,  1),
                    ( 0, -1)
                };

                foreach(var increment in increments)
                {
                    var wallRow = Row + increment.Item1;
                    var wallColumn = Column + increment.Item2;
                    if(wallRow >= 0 &&
                       wallRow < _map.Count &&
                       wallColumn >= 0 &&
                       wallColumn < _map[0].Count &&
                       _map[wallRow][wallColumn] == 1)
                        yield return new Position(_map, wallRow, wallColumn);
                }
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

            foreach(var neighbourPosition in position.Neighbours)
            {
                var neighbour = vertices[neighbourPosition.Row, neighbourPosition.Column];
                if(neighbour != null &&
                   neighbour.Distance > current.Distance + 1)
                    neighbour.UpdateParent(current);

            }

            foreach(var neighbourPosition in position.Neighbours)
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
            foreach(var wallPosition in vertex.Position.SurroundingWalls)
            {
                var neighbourRow =  2 * wallPosition.Row - vertex.Position.Row;
                var neighbourColumn = 2 * wallPosition.Column - vertex.Position.Column;

                if(neighbourRow >= 0 &&
                   neighbourRow < map.Count &&
                   neighbourColumn >= 0 &&
                   neighbourColumn < map[0].Count &&
                   entryShortestPathTreeVertices[neighbourRow, neighbourColumn] != null)
                    distance = Math.Min(
                        distance,
                        vertex.Distance + entryShortestPathTreeVertices[neighbourRow, neighbourColumn].Distance + 1);
            }

            foreach(var child in vertex.Children)
                distance = FindShortest(
                    map,
                    child,
                    distance,
                    entryShortestPathTreeVertices);

            return distance;
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
