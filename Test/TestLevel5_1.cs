using NUnit.Framework;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestLevel5_1: Test
    {
        private bool[][][][]       _preimages00 = new bool[2][][][];
        private bool[][][][][][]   _preimages0_ = new bool[2][][][][][];
        private bool[][][][][][]   _preimages_0 = new bool[2][][][][][];
        private bool[][][][][][][] _preimages__ = new bool[2][][][][][][];

        private bool TPlusOneValue(
            bool[][] block
            )
        {
            var sum = 0;
            for(var row = 0;row < block.Length;++row)
                for(var column = 0;column < block[row].Length;++column)
                    sum += block[row][column] ? 1 : 0;
            return sum == 1;
        }

        public TestLevel5_1()
        {
            var cellValues = new[] { false, true };

            var rows = new List<bool[]>();
            foreach(var cellValue1 in cellValues)
                foreach(var cellValue2 in cellValues)
                    rows.Add(new[] { cellValue1, cellValue2 });

            var blocks = new List<bool[][]>();
            foreach(var row1 in rows)
                foreach(var row2 in rows)
                    blocks.Add(new[] { row1, row2 });

            foreach(var tPlusOneValue in cellValues)
                _preimages00[tPlusOneValue ? 1 : 0] = blocks.Where(block => tPlusOneValue == TPlusOneValue(block)).ToArray();

            foreach(var tPlusOneValue in cellValues)
            {
                _preimages0_[tPlusOneValue ? 1 : 0] = new bool[2][][][][];
                foreach(var row0Value in cellValues)
                {
                    _preimages0_[tPlusOneValue ? 1 : 0][row0Value ? 1 : 0] = new bool[2][][][];
                    foreach(var row1Value in cellValues)
                        _preimages0_[tPlusOneValue ? 1 : 0][row0Value ? 1 : 0][row1Value ? 1 : 0] = _preimages00[tPlusOneValue ? 1 : 0].Where(
                            block =>
                               row0Value == block[0][0] &&
                               row1Value == block[1][0]).ToArray();
                }
            }

            foreach(var tPlusOneValue in cellValues)
            {
                _preimages_0[tPlusOneValue ? 1 : 0] = new bool[2][][][][];
                foreach(var column0Value in cellValues)
                {
                    _preimages_0[tPlusOneValue ? 1 : 0][column0Value ? 1 : 0] = new bool[2][][][];
                    foreach(var column1Value in cellValues)
                        _preimages_0[tPlusOneValue ? 1 : 0][column0Value ? 1 : 0][column1Value ? 1 : 0] =
                            _preimages00[tPlusOneValue ? 1 : 0].Where(
                                block =>
                                    column0Value == block[0][0] &&
                                    column1Value == block[0][1]).ToArray();
                }
            }

            foreach(var tPlusOneValue in cellValues)
            {
                _preimages__[tPlusOneValue ? 1 : 0] = new bool[2][][][][][];
                foreach(var __Value in cellValues)
                {
                    _preimages__[tPlusOneValue ? 1 : 0][__Value ? 1 : 0] = new bool[2][][][][];
                    foreach(var _PlusOne_Value in cellValues)
                    {
                        _preimages__[tPlusOneValue ? 1 : 0][__Value ? 1 : 0][_PlusOne_Value ? 1 : 0] = new bool[2][][][];
                        foreach(var __PlusOneValue in cellValues)
                            _preimages__[tPlusOneValue ? 1 : 0][__Value ? 1 : 0][_PlusOne_Value ? 1 : 0][__PlusOneValue ? 1 : 0] =
                                _preimages0_[tPlusOneValue ? 1 : 0][__Value ? 1 : 0][_PlusOne_Value ? 1 : 0].Where(
                                    block => __PlusOneValue == block[0][1]).ToArray();
                    }
                }
            }
        }

        [TestCase]
        public void TestPreimage00()
        {
            var cellValues = new[] { false, true };
            foreach(var tPlusOneValue in cellValues)
                foreach(var block in _preimages00[tPlusOneValue ? 1 : 0])
                    Assert.That(TPlusOneValue(block), Is.EqualTo(tPlusOneValue));
        }

        [TestCase]
        public void TestPreimage0_()
        {
            var cellValues = new[] { false, true };
            foreach(var tPlusOneValue in cellValues)
                foreach(var row0Value in cellValues)
                    foreach(var row1Value in cellValues)
                        foreach(var block in _preimages0_[tPlusOneValue ? 1 : 0][row0Value ? 1 : 0][row1Value ? 1 : 0])
                        {
                            Assert.That(TPlusOneValue(block), Is.EqualTo(tPlusOneValue));
                            Assert.That(block[0][0], Is.EqualTo(row0Value));
                            Assert.That(block[1][0], Is.EqualTo(row1Value));
                        };

        }

        [TestCase]
        public void TestPreimage_0()
        {
            var cellValues = new[] { false, true };
            foreach(var tPlusOneValue in cellValues)
                foreach(var column0Value in cellValues)
                    foreach(var column1Value in cellValues)
                        foreach(var block in _preimages_0[tPlusOneValue ? 1 : 0][column0Value ? 1 : 0][column1Value ? 1 : 0])
                        {
                            Assert.That(TPlusOneValue(block), Is.EqualTo(tPlusOneValue));
                            Assert.That(block[0][0], Is.EqualTo(column0Value));
                            Assert.That(block[0][1], Is.EqualTo(column1Value));
                        };
        }

        [TestCase]
        public void TestPreimage__()
        {
            var cellValues = new[] { false, true };
            foreach(var tPlusOneValue in cellValues)
                foreach(var __Value in cellValues)
                    foreach(var _PlusOne_Value in cellValues)
                        foreach(var __PlusOneValue in cellValues)
                            foreach(var block in _preimages__[tPlusOneValue ? 1 : 0][__Value ? 1 : 0][_PlusOne_Value ? 1 : 0][__PlusOneValue ? 1 : 0])
                            {
                                Assert.That(TPlusOneValue(block), Is.EqualTo(tPlusOneValue));
                                Assert.That(block[0][0], Is.EqualTo(__Value));
                                Assert.That(block[1][0], Is.EqualTo(_PlusOne_Value));
                                Assert.That(block[0][1], Is.EqualTo(__PlusOneValue));
                            };
        }

        private bool[][] Transpose(
            bool[][] image
            )
        {
            var transpose = new bool[image[0].Length][];

            for(var row = 0;row < transpose.Length;++row)
                transpose[row] = new bool[image.Length];

            for(var row = 0;row < image.Length;++row)
                for(var column = 0;column < image[row].Length;++column)
                    transpose[column][row] = image[row][column];

            return transpose;
        }

        private bool[][] ReflectX(
            bool[][] image
            )
        {
            var reflected = new bool[image.Length][];
            for(var row = 0;row < image.Length;++row)
                reflected[row] = image[image.Length - row - 1];
            return reflected;
        }

        private bool[][] ReflectY(
            bool[][] image
            )
        {
            var reflected = new bool[image.Length][];
            for(var row = 0;row < image.Length;++row)
            {
                reflected[row] = new bool[image[row].Length];
                for(var column = 0;column < image[row].Length;++column)
                    reflected[row][column] = image[row][image[row].Length - column - 1];
            }
            return reflected;
        }

        private bool[][] Optimise(
            bool[][] image
            )
        {
            // Optimise image.
            // Row 0 has the least constraints on the preimage candidates.
            // Ensure the row has the smallest dimension to minimise the number of row 0 preimage candidates.
            if(image[0].Length > image.Length)
                image = Transpose(image);

            // A cell with a true value only has 4 possible preimages whereas a cell containing false has 12 possible preimages.
            // Therefore need to encounter a cell containing true as quickly as possible to reduce the number of combinations
            // to be counted.
            // Find the corner which has the shortest distance to a cell containing true.
            var images = new[]
            {
                image,
                ReflectX(image),
                ReflectY(image),
                ReflectY(ReflectX(image))
            };

            bool[][] optimalImage = null;
            int shortestDistance = 0;

            foreach(var candidateImage in images)
            {
                var distance = int.MaxValue;
                for(var row = 0;row < candidateImage.Length && distance == int.MaxValue;++row)
                    for(var column = 0;column < candidateImage[row].Length && distance == int.MaxValue;++column)
                        if(candidateImage[row][column])
                            distance = row * image[0].Length + column + 1;

                if(optimalImage == null)
                {
                    optimalImage = candidateImage;
                    shortestDistance = distance;
                }
                else if(distance < shortestDistance)
                {
                    optimalImage = candidateImage;
                    shortestDistance = distance;
                }
            }

            return optimalImage;
        }

        private int CountPreimagesNonRecursive(
            bool[][] image
            )
        {
            // Treat gas as a 2D Cellular Automaton (CA).
            // Contruct preimage 1 row at a time.

            // Optimise image for performance.
            image = Optimise(image);

            var preimages = new bool[image.Length][][][][];
            for(var r = 0;r < preimages.Length;++r)
                preimages[r] = new bool[image[0].Length][][][];

            var preimageIndices = new int[preimages.Length][];
            for(var r = 0;r < preimageIndices.Length;++r)
                preimageIndices[r] = new int[preimages[0].Length];

            preimages[0][0] = _preimages00[image[0][0] ? 1 : 0];

            var row    = 0;
            var column = 0;
            var count  = 0;
            var cycles = 0;

            while(row >= 0)
            {
                if(column < image[0].Length)
                {
                    if(preimageIndices[row][column] < preimages[row][column].Length)
                    {
                        // Advance column.
                        column += 1;
                        if(column < image[0].Length)
                        {
                            var leftBlock = preimages[row][column - 1][preimageIndices[row][column - 1]];
                            if(row > 0)
                            {
                                var topBlock = preimages[row - 1][column][preimageIndices[row - 1][column]];
                                preimages[row][column] = _preimages__[image[row][column] ? 1 : 0][leftBlock[0][1] ? 1 : 0][leftBlock[1][1] ? 1 : 0][topBlock[1][1] ? 1 : 0];
                            }
                            else
                                preimages[row][column] = _preimages0_[image[row][column] ? 1 : 0][leftBlock[0][1] ? 1 : 0][leftBlock[1][1] ? 1 : 0];

                            preimageIndices[row][column] = 0;
                        }
                    }
                    else
                    {
                        column -= 1;

                        if(column >= 0)
                            preimageIndices[row][column] += 1;

                        else
                        {
                            row -= 1;
                            column = image[0].Length - 1;

                            if(row >= 0)
                                preimageIndices[row][column] += 1;
                        }
                    }
                }
                else
                {
                    if(row == preimages.Length - 1)
                    {
                        count += 1;
                        column -= 1;
                        preimageIndices[row][column] += 1;
                    }
                    else
                    {
                        row += 1;
                        column = 0;

                        var topBlock = preimages[row - 1][column][preimageIndices[row - 1][column]];
                        preimages[row][column] = _preimages_0[image[row][column] ? 1 : 0][topBlock[1][0] ? 1 : 0][topBlock[1][1] ? 1 : 0];
                        preimageIndices[row][column] = 0;
                    }
                }

                ++cycles;
            }

            TestContext.WriteLine("Cycles: " + cycles);

            return count;
        }

        [TestCaseSource(typeof(TestLevel5), "TestCases"), Timeout(20000)]
        public void Test(
            bool[][] image,
            int      expectedCount
            )
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            Assert.That(CountPreimagesNonRecursive(image), Is.EqualTo(expectedCount));
            stopwatch.Stop();
            TestContext.WriteLine("Elapsed: " + stopwatch.ElapsedMilliseconds);
        }
    }
}

