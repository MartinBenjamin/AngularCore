using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    public struct Position
    {
        private static readonly (int, int)[] _increments = new (int, int)[]
        {
            (  1,  0 ),
            ( -1,  0 ),
            (  0,  1 ),
            (  0, -1 )
        };

        public IList<IList<int>> Map    { get; private set; }
        public int               Row    { get; private set; }
        public int               Column { get; private set; }

        public Position(
            IList<IList<int>> map,
            int               row,
            int               column
            )
        {
            Map    = map;
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
                            _this.Map,
                            _this.Row    + increment.Item1,
                            _this.Column + increment.Item2))
                    .Where(
                        position =>
                            position.Row    >= 0 &&
                            position.Row    < position.Map.Count &&
                            position.Column >= 0 &&
                            position.Column < position.Map[0].Count &&
                            position.Map[position.Row][position.Column] == 0);
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
                            _this.Map,
                            _this.Row    + increment.Item1,
                            _this.Column + increment.Item2))
                    .Where(
                        position =>
                            position.Row    >= 0 &&
                            position.Row    < position.Map.Count &&
                            position.Column >= 0 &&
                            position.Column < position.Map[0].Count &&
                            position.Map[position.Row][position.Column] == 1);
            }
        }
    }

    [TestFixture]
    public class TestLevel3_2: Test
    {
        private static readonly (int, int)[] _increments = new (int, int)[]
        {
            (  1,  0 ),
            ( -1,  0 ),
            (  0,  1 ),
            (  0, -1 )
        };

        private int PathLength(
            IList<IList<int>> map
            )
        {
            // Generate shortest path tree for exit vertex.
            var exitDistances = ShortestDistances(
                map,
                map.Count - 1,
                map[0].Count - 1);

            var entryDistances = ShortestDistances(
                map,
                0,
                0);

            return ShortestCombination(
                map,
                exitDistances,
                entryDistances);
        }

        private int[,] ShortestDistances(
            IList<IList<int>> map,
            int               initialRow,
            int               initialColumn
            )
        {
            var distances = new int[map.Count, map[0].Count];
            var vertices = 0;
            for(var row = 0;row < map.Count;++row)
                for(var column = 0;column < map[0].Count;++column)
                {
                    distances[row, column] = int.MaxValue;
                    if(map[row][column] == 0)
                        vertices += 1;
                }

            distances[initialRow, initialColumn] = 1;

            var eligible = new List<(int, int)> { ( initialRow, initialColumn ) };
            while(eligible.Count > 0)
            {
                var minDistance = int.MaxValue;
                var minIndex    = 0;
                var row         = 0;
                var column      = 0;
                for(var index = 0;index < eligible.Count;++index)
                {
                    var distance = distances[eligible[index].Item1, eligible[index].Item2];
                    if(distance < minDistance)
                    {
                        minDistance = distance;
                        minIndex    = index;
                    }
                }

                (row, column) = eligible[minIndex];
                eligible.RemoveAt(minIndex);

                _increments
                    .Select(
                        increment => (row + increment.Item1, column + increment.Item2))
                    .Where(
                        neighbourPosition =>
                            neighbourPosition.Item1 >= 0 &&
                            neighbourPosition.Item1 < map.Count &&
                            neighbourPosition.Item2 >= 0 &&
                            neighbourPosition.Item2 < map[0].Count &&
                            map[neighbourPosition.Item1][neighbourPosition.Item2] == 0)
                    .ForEach(
                        neighbourPosition =>
                        {
                            var distance = distances[neighbourPosition.Item1, neighbourPosition.Item2];
                            if(distance == int.MaxValue)
                                eligible.Add((neighbourPosition.Item1, neighbourPosition.Item2));

                            distances[neighbourPosition.Item1, neighbourPosition.Item2] = Math.Min(
                                distance,
                                distances[row, column] + 1);
                        });
            }

            return distances;
        }

        private int ShortestCombination(
            IList<IList<int>> map,
            int[,]            exitDistances,
            int[,]            entryDistances
            )
        {
            var distance = exitDistances[0, 0];

            for(var row = 0;row < map.Count;++row)
                for(var column = 0;column < map[0].Count;++column)
                    if(map[row][column] == 0 && exitDistances[row, column] != int.MaxValue)
                        foreach(var increment1 in _increments)
                        {
                            var wallRow    = row    + increment1.Item1;
                            var wallColumn = column + increment1.Item2;

                            if(wallRow    >= 0 &&
                               wallRow    < map.Count &&
                               wallColumn >= 0 &&
                               wallColumn < map[0].Count &&
                               map[wallRow][wallColumn] == 1)
                            {

                                foreach(var increment2 in _increments)
                                    if(increment1.Item1 + increment2.Item1 != 0 ||
                                       increment1.Item2 + increment2.Item2 != 0)
                                    {
                                        var neighbourRow    = wallRow    + increment2.Item1;
                                        var neighbourColumn = wallColumn + increment2.Item2;

                                        if(neighbourRow >= 0 &&
                                           neighbourRow < map.Count &&
                                           neighbourColumn >= 0 &&
                                           neighbourColumn < map[0].Count &&
                                           map[neighbourRow][neighbourColumn] == 0 &&
                                           entryDistances[neighbourRow, neighbourColumn] != int.MaxValue)
                                        {
                                            distance = Math.Min(
                                                  distance,
                                                  exitDistances[row, column] + entryDistances[neighbourRow, neighbourColumn] + 1);

                                            if(distance == map.Count + map[0].Count - 1)
                                            {
                                                TestContext.WriteLine($"Removed Row: {row}, Column: {column}, Wall Row: {wallRow}, Wall Column: {wallColumn}");
                                                return distance;
                                            }
                                        }
                                    }
                            }

                        }

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
                    },

                    new object[]
                    {
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
                        },
                        19
                    },

                    new object[]
                    {
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{0, 0, 0, 1, 1, 1, 1, 1, 1, 0},
                            new TestDataList<int>{0, 1, 1, 0, 0, 0, 0, 0, 0, 0},
                            new TestDataList<int>{0, 1, 1, 1, 1, 1, 1, 1, 1, 0},
                            new TestDataList<int>{0, 1, 1, 0, 0, 0, 0, 0, 1, 0},
                            new TestDataList<int>{0, 0, 0, 1, 0, 0, 0, 0, 1, 0},
                            new TestDataList<int>{1, 1, 0, 1, 0, 0, 0, 0, 1, 0},
                            new TestDataList<int>{1, 1, 0, 1, 0, 0, 0, 0, 1, 0},
                            new TestDataList<int>{0, 0, 0, 1, 0, 0, 0, 0, 1, 0},
                            new TestDataList<int>{0, 1, 1, 1, 1, 1, 1, 1, 1, 0},
                            new TestDataList<int>{0, 1, 1, 1, 1, 1, 1, 1, 1, 0},
                            new TestDataList<int>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
                        },
                        20
                    }
                };
            }
        }
    }
}
