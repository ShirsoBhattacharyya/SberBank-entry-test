const { TimeFrame } = require("./TimeFrame");
const fs = require("fs");

const process = (timeframe) => {
  /*
   * Requirements:
   *   Node 16.14.0
   * POST YOUR CODE HERE!
   * SOLVE THIS TASK:
   * We have input data in "test-data" directory
   * This is some array of json files, which represents matrices of data, some measures which done in some time.
   * First column is dateTime – the milliseconds since January 1, 1970, 00:00:00 GMT
   * Second column is some measure in Integer format
   * Also we have ENUM Timeframe which represents set of timeframes(code and milliseconds in frame)
   * You should parse ALL input data files(use jackson lib, included in project) and make some data transformation.
   * Transformation is: you need build result matrix for each input data file, format is
   * [[a,b,c],[a,b,c]... etc]
   * where
   *  a: start millisecond of current timeframe of measure
   *  b: start millisecond of next frame
   *  c: average value of measures which done in that frame, divide operation should be performed with rounding to 2 digits, with "half up" rule.
   *  avg = (m1+m2+m3+...)/N (where m1,m2,... is measurements and N is measurements count)
   *     please pay attention: if you have no measures in frame, average value for this frame will be 0, and frame should exist in result!
   *     if some measure time equals with timeframe start, it should be counted only in timeframe where time equals timeframe start
   * For example:
   * #1
   * For input array: [[123,2],[124,6],[60100,8],[60200,2]]
   * For M1 timeframe result should be:[[0,60000,4],[60000,120000,5]]
   *
   * #2
   * For input array: [[60100,8],[60200,2], [240100,8],[240200,2]]
   * For M1 timeframe result should be: [[60000,120000,5],[120000,180000,0],[180000,240000,0],[240000,300000,5]]
   *
   * Result file should be written to result-data/%timeFrame.code%/ directory(you can use enum code to get timeframe directory),
   * all directories are already provided. File should be with the exact same name as input file, for example:
   * Result calculation for file "test-data/data1.json" in H1 timeframe should be written to "result-data/H1/data1.json"
   *
   * You are not allowed to use any external libraries except fs
   * Please send your code to HR partner with your CV!
   * */
  const inputDir = "../test-data";
  const resultDir = `../result-data/${timeframe}`;

  fs.readdirSync(inputDir).forEach((filename) => {
    if (filename.endsWith(".json")) {
      const filePath = `${inputDir}/${filename}`;
      const jsonData = fs.readFileSync(filePath, "utf8");

      // Since, Jackson Library is a Java Library, jar files are not supported in NodeJS application. 
      // Therefore, I have used default JSON.parse() for parsing.
      const measurements = JSON.parse(jsonData);
      
      // The function transformData() accepts 2 parameters: measurements and Timeframe[timeframe] for transforming the input data.
      const resultMatrix = transformData(measurements, TimeFrame[timeframe]);

      // Checking if the result directory exists or not
      if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir, { recursive: true });
      }

      // Defining the result path
      const resultFilePath = `${resultDir}/${filename}`;

      // Generating the result file in the path after stringifying the result matrix.
      fs.writeFileSync(resultFilePath, JSON.stringify(resultMatrix), "utf8");
    }
  });
};

const transformData = (measurements, timeframeMilliseconds) => {
  const resultMatrix = [];
  let currentFrameStart = 0;
  let currentFrameSum = 0;
  let currentFrameCount = 0;

  measurements.forEach(([timestamp, measure]) => {
    // Determine the timeframe index for the current timestamp
    const timeframeIndex = Math.floor(
      (timestamp - currentFrameStart) / timeframeMilliseconds
    );

    // If a new timeframe has started, calculate the average for the previous timeframe
    if (timeframeIndex > currentFrameCount) {
      const average =
        currentFrameCount === 0 ? 0 : currentFrameSum / currentFrameCount;
      resultMatrix.push([
        currentFrameStart,
        currentFrameStart + timeframeMilliseconds,
        average.toFixed(2),
      ]);

      // Reset variables for the new timeframe
      currentFrameStart += timeframeMilliseconds;
      currentFrameSum = 0;
      currentFrameCount = 0;
    }

    // Add the measure to the current timeframe
    currentFrameSum += measure;
    currentFrameCount++;
  });

  // Calculate and add the last timeframe
  const average =
    currentFrameCount === 0 ? 0 : currentFrameSum / currentFrameCount;
  resultMatrix.push([
    currentFrameStart,
    currentFrameStart + timeframeMilliseconds,
    average.toFixed(2),
  ]);

  return resultMatrix;
};

const main = () => {
  let start = Date.now();
  for (let timeframe in TimeFrame) {
    process(timeframe);
  }
  let time = Date.now() - start;
  console.log("TASK WAS COMPLETED IN " + time + " MS");
};

main();