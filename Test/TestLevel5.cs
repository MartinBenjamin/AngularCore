using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    [TestFixture]
    public class TestLevel5: Test
    {
        private static bool[] _00 = new[] { false, false };
        private static bool[] _01 = new[] { false, true  };
        private static bool[] _10 = new[] { true , false };
        private static bool[] _11 = new[] { true , true  };

        private static bool[][] _pathSegments = new[] { _00, _01, _10, _11 };

        private bool[][][]     _preimagesRow0 = new bool[2][][];
        private bool[][][][][] _preimages;

        private bool TPlusOneValue(
            bool[] row0,
            bool[] row1
            )
        {
            var sum = 0;
            sum = row0[0] ? sum + 1 : sum;
            sum = row0[1] ? sum + 1 : sum;
            sum = row1[0] ? sum + 1 : sum;
            sum = row1[1] ? sum + 1 : sum;

            return sum == 1;
        }

        public TestLevel5()
        {
            // Derive preimage lookup for first row.
            var cellValues = new[] { false, true };
            var preimagesRow0 = new[]
            {
                new List<bool[]>(),
                new List<bool[]>()
            };

            foreach(var tPlusOneValue in cellValues)
                for(var index1 = 0;index1 < _pathSegments.Length;++index1)
                    for(var index2 = 0;index2 < _pathSegments.Length;++index2)
                        if(tPlusOneValue == TPlusOneValue(
                            _pathSegments[index1],
                            _pathSegments[index2]))
                        {
                            preimagesRow0[tPlusOneValue ? 1 : 0].Add(_pathSegments[index1]);
                            break;
                        }

            for(var index = 0;index < preimagesRow0.Length;++index)
                _preimagesRow0[index] = preimagesRow0[index].ToArray();

            // Derive preimage lookup for rows other than first.
            var preimages = new[]
            {
                new[]
                {
                    new[]
                    {
                        new List<bool[]>(),
                        new List<bool[]>()
                    },
                    new[]
                    {
                        new List<bool[]>(),
                        new List<bool[]>()
                    }
                },
                new[]
                {
                    new[]
                    {
                        new List<bool[]>(),
                        new List<bool[]>()
                    },
                    new[]
                    {
                        new List<bool[]>(),
                        new List<bool[]>()
                    }
                }
            };

            _preimages = new[]
            {
                new[]
                {
                    new[]
                    {
                        new bool[2][],
                        new bool[2][]
                    },
                    new[]
                    {
                        new bool[2][],
                        new bool[2][]
                    }
                },
                new[]
                {
                    new[]
                    {
                        new bool[2][],
                        new bool[2][]
                    },
                    new[]
                    {
                        new bool[2][],
                        new bool[2][]
                    }
                }
            };

            foreach(var tPlusOneValue in cellValues)
                for(var index1 = 0;index1 < _pathSegments.Length;++index1)
                {
                    var pathSegment1 = _pathSegments[index1];
                    for(var index2 = 0;index2 < _pathSegments.Length;++index2)
                    {
                        var pathSegment2 = _pathSegments[index2];
                        if(tPlusOneValue == TPlusOneValue(
                            pathSegment1,
                            pathSegment2))
                            preimages[tPlusOneValue ? 1 : 0][pathSegment1[0] ? 1 : 0][pathSegment1[1] ? 1 : 0].Add(pathSegment2);
                    }
                }

            for(var index1 = 0;index1 < cellValues.Length;++index1)
                for(var index2 = 0;index2 < cellValues.Length;++index2)
                    for(var index3 = 0;index3 < cellValues.Length;++index3)
                        _preimages[index1][index2][index3] = preimages[index1][index2][index3].ToArray();

        }

        [TestCase]
        public void TestPreimage2()
        {
            var cellValues = new[] { false, true };
            foreach(var tPlusOneValue in cellValues)
                foreach(var pathSegment1 in _pathSegments)
                    foreach(var pathSegment2 in _pathSegments)
                        Assert.That(
                            _preimages[tPlusOneValue ? 1 : 0][pathSegment1[0] ? 1 : 0][pathSegment1[1] ? 1 : 0].Contains(pathSegment2),
                            Is.EqualTo(tPlusOneValue == TPlusOneValue(
                                pathSegment1,
                                pathSegment2)));
        }

        private int ProcessRow(
            IList<IList<bool>> image,
            bool[][][][]       preimageNetworks,
            int[][]            pathSegmentIndices,
            int                row,
            int                count
            )
        {
            if(row == preimageNetworks.Length)
                return count += 1;

            // Initialise preimage network.
            var preimageNetwork = preimageNetworks[row];
            if(row == 0)
                for(var c = 0;c < preimageNetwork.Length;++c)
                    preimageNetwork[c] = _preimagesRow0[image[row][c] ? 1 : 0];

            else
                for(var c = 0;c < preimageNetwork.Length;++c)
                    preimageNetwork[c] = _preimages[image[row - 1][c] ? 1 : 0]
                        [preimageNetworks[row - 1][c][pathSegmentIndices[row - 1][c]][0] ? 1 : 0]
                        [preimageNetworks[row - 1][c][pathSegmentIndices[row - 1][c]][1] ? 1 : 0];

            var rowPathSegmentIndices = pathSegmentIndices[row];
            for(var c = 0;c < rowPathSegmentIndices.Length;++c)
                rowPathSegmentIndices[c] = 0;

            var column = 0;

            while(column >= 0)
            {
                if(column < image[0].Count)
                {
                    if(rowPathSegmentIndices[column] == preimageNetwork[column].Length) // No matching next path segment.
                    {
                        column -= 1;

                        if(column >= 0)
                            rowPathSegmentIndices[column] += 1;
                    }
                    else
                    {
                        if(column == 0 ||
                           preimageNetwork[column - 1][rowPathSegmentIndices[column - 1]][1] == preimageNetwork[column][rowPathSegmentIndices[column]][0])
                        {
                            // Matching next path segment.
                            column += 1;

                            if(column < image[0].Count)
                                rowPathSegmentIndices[column] = 0;
                        }
                        else
                            rowPathSegmentIndices[column] += 1;
                    }
                }
                else
                {
                    // Found valid path through row preimage network.
                    // Progress to next row.
                    count = ProcessRow(
                        image,
                        preimageNetworks,
                        pathSegmentIndices,
                        row + 1,
                        count);

                    column -= 1;

                    if(column >= 0)
                        rowPathSegmentIndices[column] += 1;
                }
            }

            return count;
        }

        private int CountPreimages(
            bool[][] image
            )
        {
            // Treat gas as a 2D Cellular Automaton (CA).
            // Contruct preimage 1 row at a time.
            // Process the rows recursively as the height of the image will be at most 9.
            var preimageNetworks = new bool[image.Length + 1][][][];
            for(var row = 0;row < preimageNetworks.Length;++row)
                preimageNetworks[row] = new bool[image[0].Length][][];

            var pathSegmentIndices = new int[preimageNetworks.Length][];
            for(var row = 0;row < pathSegmentIndices.Length;++row)
                pathSegmentIndices[row] = new int[preimageNetworks[0].Length];

            return ProcessRow(
                image,
                preimageNetworks,
                pathSegmentIndices,
                0,
                0);
        }

        [TestCaseSource("TestCases"), Timeout(10000)]
        public void Test(
            bool[][] image,
            int      expectedCount
            )
        {
            Assert.That(CountPreimages(image), Is.EqualTo(expectedCount));
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        new[]
                        {
                            new[] { true , false, true  },
                            new[] { false, true , false },
                            new[] { true , false, true  }
                        },
                        4
                    },
                    new object[]
                    {
                        new[]
                        {
                            new[] { true, true, false, true, false, true, false, true, true, false },
                            new[] { true, true, false, false, false, false, true, true, true, false },
                            new[] { true, true, false, false, false, false, false, false, false, true },
                            new[] { false, true, false, false, false, false, true, true, false, false }
                        },
                        11567
                    },
                    new object[]
                    {
                        new[]
                        {
                            new[] { true, false, true, false, false, true, true, true },
                            new[] { true, false, true, false, false, false, true, false },
                            new[] { true, true, true, false, false, false, true, false },
                            new[] { true, false, true, false, false, false, true, false },
                            new[] { true, false, true, false, false, true, true, true }
                        },
                        254
                    }
                };
            }
        }
    }
}
