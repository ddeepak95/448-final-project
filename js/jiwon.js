// Constants
const svgHeight = "800";
const svgWidth = document.getElementById("mainContainer").offsetWidth;
const margin = {top: 20, right: 20, bottom: 60, left: 120};
const sliderValueToMonthYear = [
  "July 2021",
  "August 2021",
  "September 2021",
  "October 2021",
  "November 2021",
  "December 2021",
  "January 2022",
  "February 2022",
  "March 2022",
  "April 2022",
  "May 2022",
  "June 2022"
];
const states = ["Alaska",
  "Arkansas",
  "Florida",
  "Georgia",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Maine",
  "Maryland",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "New Jersey",
  "New York",
  "North Carolina",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "Wisconsin"];

// const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000'];
// const colorScale = d3.scaleOrdinal(colors);
// const color = d3.scaleSqrt().domain([0, 500]).range(["#f2e3e1", "#e15759"])

// Global variables
var svg;
var data;
var xScale;
var yScale;
var isCumulative;
var isPlaying;
var curMonthYear;

setInterval(function() {
  if (!isPlaying) return;
  var monthYear = document.getElementById("monthYear");
  var monthYearIndex = parseInt(monthYear.value)
  
  if (monthYearIndex < 11) {
    monthYearIndex += 1;
  } else {
    monthYearIndex = 0;
  }

  monthYear.value = monthYearIndex;
  curMonthYear = monthYearIndex;
  updateSlider(monthYearIndex)
  
},1500);

function playPauseSlider() {
  isPlaying = !isPlaying;

  var buttonText = document.getElementById("buttonText");
  if (isPlaying) {
    buttonText.innerHTML = "Stop";
  } else {
    buttonText.innerHTML = "Play";
  }
}

// On load of page
window.addEventListener("load", (e) => {
  loadGraph();
});

// Load graph
function loadGraph() {
  // Load data
  data = restData;

  // Initialize elements
  initializeElements();

  console.log("Page is fully loaded");
}

function updateYAxis() {
  // y-scale
  yScale = d3.scaleBand()
    .domain(numBooksDataEntries.map(d => d.state))
    .range([svgHeight - margin.top - margin.bottom, 0]) // chartHeight
    .padding(0.1);
  
  // Add y-axis
  d3.select("#yAxis")
    .transition()         // <-- akin to a D3 selection, but interpolates values
      .duration(1000)
      .call(d3.axisLeft(yScale));
}

function updateBars() {}

function updateGraphType(value) {
  if (String(value) === "cumulative") {
    isCumulative = true;
  } else {
    isCumulative = false;
  }
  updateSlider(curMonthYear);
}

// Called on change of slider
function updateSlider(value) {
  
  curMonthYear = value;
  var sliderMonthYear = sliderValueToMonthYear[value];
  var sliderDate = new Date(sliderMonthYear);

  const transition = svg.transition()
    .duration(1000)
    .ease(d3.easeCubic);
  
  var numBooksDataEntries;

  if (isCumulative) {
    // filter data for bars
    data = restData.filter(d => {
      rowDate = new Date(d["Date of Challenge/Removal"]);
      return rowDate < sliderDate || rowDate.getMonth() === sliderDate.getMonth();
    });
  } else {
    // non-cumulative
    data = restData.filter(d => d["Date of Challenge/Removal"] === sliderMonthYear);
    // numBooksDataEntries = updateAndGetData();
  }

  // numBooksDataEntries = updateAndGetData();
  numBooksDataEntries = updateAndGetData().sort((a, b) => b.count - a.count).slice(0, 10).reverse();

  // 1) set x-scale
  xScale = d3.scaleLinear()
    .domain([0, d3.max(numBooksDataEntries, d => d.count)])
    .range([0, svgWidth - margin.left - margin.right]);

  // 1.1) set x-axis
  d3.select("#xAxis")
    .transition()
      .duration(1000)
      .call(d3.axisBottom(xScale));
  
  const xGrid = d3.axisBottom()
    .scale(xScale)
    .tickFormat('')
    .ticks(8)
    .tickSizeInner(-(svgHeight - margin.top - margin.bottom));
  
  const hi = d3.select("#x-grid")
    .transition()
      .duration(1000)
      .call(xGrid);
  console.log(hi);
  
  // 2) set y-scale / set y-axis
  // updateYAxis();

  // y-scale
  yScale = d3.scaleBand()
    .domain(numBooksDataEntries.map(d => d.state))
    .range([svgHeight - margin.top - margin.bottom, 0]) // chartHeight
    .padding(0.1);
  
  // Add y-axis
  // d3.select("#yAxis")
  //   .transition()         // <-- akin to a D3 selection, but interpolates values
  //     .duration(1000)
  //     .call(d3.axisLeft(yScale));
  d3.select("#yAxis")
    .transition()         // <-- akin to a D3 selection, but interpolates values
      .duration(1000)
      .call(d3.axisLeft(yScale));

  // 3) re-draw bars
  const barGroup = d3.select("#barGroup");
  barGroup.selectAll("rect")
    .data(numBooksDataEntries, d => d.state)
    .join(
      enter => enter.append("rect")
        .attr("x", xScale(0))
        .attr("y", svgHeight - margin.top - margin.bottom)
        .attr("width", 0)
        .attr("height", yScale.bandwidth())
        // .attr("fill", color())
        .attr("fill-opacity", 0)
        .on("mouseover", function (event, d) {
          // console.log(d);
          // console.log(event);
          // console.log(enter);
          updateToolTip(event.state, event.count);
        })
        .on("mouseleave", function (event, d) {
          hideToolTip();
        }),
      update => update,
      exit => exit.transition()
        .duration(1000)
        .attr('y', svgHeight - margin.top - margin.bottom)
        .attr("width", 0)
        // .attr("fill", "steelblue")
        .attr("fill-opacity", 0)
        .remove()
    )
    .call(bar => bar.transition(transition)
      .attr("x", xScale(0))
      .attr("y", d => yScale(d.state))
      .attr("width", d => xScale(d.count))
      .attr("height", yScale.bandwidth())
      // .attr("fill", d => colorScale(d.state)) // HEREEE
      // .attr("fill", function(d) {
      //   const color = d3.scalePow().exponent(0.5).domain([0, d3.max(numBooksDataEntries, d => d.count)]).range(["#f2e3e1", "#e15759"])
      //   return color(d.count);
      // })
      .attr("fill", "#e15759")
      .attr("fill-opacity", 0.6));
  
  // re-label background label
  d3.select("#monthYearLabel")
    .text(formatMonthYearForBackgroundLabel(sliderDate));
}

function formatMonthYearForBackgroundLabel(date) {
  var monthInt = date.getMonth() + 1;
  var monthStr;
  if (monthInt < 10) {
    monthStr = "0" + String(monthInt);
  } else {
    monthStr = String(monthInt);
  }

  var yearFullStr = String(date.getFullYear());
  var yearStr = yearFullStr.slice(-2);

  return monthStr + "/" + yearStr;
}

function updateAndGetData(monthYear=-1) {
  var numBooksData = new Map();

  for (let i = 0; i < states.length; i++) {
    numBooksData[states[i]] = 0;
  }

  for (let i = 0; i < data.length; i++) {
    var bookData = data[i];
    numBooksData[bookData.State] += 1;
  }

  var numBooksDataEntries = [];
  for (let [key, value] of Object.entries(numBooksData)) {
    numBooksDataEntries.push({state: key, count: value});
  }

  return numBooksDataEntries;
}

// Initialize elements
function initializeElements() {
  console.log('intialize');

  // current toggle
  isCumulative = true;
  isPlaying = false;

  // default selected month-year
  curMonthYear = 0;
  
  svg = d3.select("#categories")
    .attr("width", "100%")
    .attr("height", svgHeight);

  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  data = restData.filter(d => d["Date of Challenge/Removal"] === sliderValueToMonthYear[curMonthYear]);
  var numBooksDataEntries = updateAndGetData().sort((a, b) => b.count - a.count).slice(0, 10).reverse();
  
  // x-scale
  xScale = d3.scaleLinear()
    .domain([0, d3.max(numBooksDataEntries, d => d.count)])
    .range([0, chartWidth]);

  // y-scale
  yScale = d3.scaleBand()
    .domain(numBooksDataEntries.map(d => d.state))
    .range([chartHeight, 0])
    .padding(0.1);

  // Group for bars
  const barGroup = svg.append("g")
    .attr("id", "barGroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); // shift all bars by the margin offset

  // Add rectangles
  barGroup.selectAll('rect')
    .data(numBooksDataEntries, d => d.state)
    .join('rect')
    .attr("class", "bars")
    .attr("x", d => xScale(0))
    .attr("y", d => yScale(d.state))
    .attr("width", d => xScale(d.count))
    .attr("height", yScale.bandwidth())
    // .attr("fill", d => colorScale(d.state))  // HEREEE
    // .attr("fill", d => color(d.count))
    // .attr("fill", function(d) {
    //   const color = d3.scalePow().exponent(0.5).domain([0, d3.max(numBooksDataEntries, d => d.count)]).range(["#f2e3e1", "#e15759"])
    //   return color(d.count);
    // })
    .attr("fill", "#e15759")
    .attr("fill-opacity", 0.6)
    .on("mouseover", function (event, d) {
      // console.log(d);
      // console.log(event);
      updateToolTip(event.state, event.count);
    })
    .on("mouseleave", function (event, d) {
      hideToolTip();
    })
  
  // Tool tip listener
  var banTimelineContainer = document.getElementById("banTimeline");
  banTimelineContainer.addEventListener("mousemove", function (e) {
    var hoverBox = document.getElementById("toolTip");
    hoverBox.style.left = `${e.clientX + 8}px`;
    hoverBox.style.top = `${e.clientY + 8}px`;
  });

  // Add x-axis
  svg.append("g")
    .attr("id", "xAxis")
    .attr("transform", `translate(${margin.left}, ${chartHeight + margin.top})`)
    .call(d3.axisBottom(xScale));

  // Add x-axis gridlines
  const xGrid = d3.axisBottom()
    .scale(xScale)
    .tickFormat('')
    .ticks(8)
    .tickSizeInner(-chartHeight);
  svg.append('g')
    .attr('id', 'x-grid')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${margin.left}, ${chartHeight + margin.top})`)
    .call(xGrid);
  
  // Add y-axis
  svg.append("g")
    .attr("id", "yAxis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale));

  // Add x-axis title
  svg.append("text")
    .attr("x", margin.left + chartWidth / 2)
    .attr("y", svgHeight - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Bans");

  // Add y-axis title
  svg.append("text")
    .attr("x", -(margin.top + chartHeight / 2))
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("State");

  // Add a background label for the current month+year
  svg.append('text')
    .attr('id', 'monthYearLabel')
    .attr('x', chartWidth - 70)
    .attr('y', chartHeight - 50)
    .attr('fill', '#ccc')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-weight', 500)
    .attr('font-size', 80)
    .text("07/21");

}

// Tool tip functions

function updateToolTip(state, numBans) {
  var hoverBox = document.getElementById("toolTip");
  hoverBox.style.display = "block";

  var stateText = document.getElementById("stateText");
  stateText.innerHTML = state;

  var numBansText = document.getElementById("numBansText");
  numBansText.innerHTML = numBans;

  var numBansTextDate = document.getElementById("numBansTextDate");
  if (!isCumulative || curMonthYear === 0) {
    numBansTextDate.innerHTML = "in " + sliderValueToMonthYear[curMonthYear];
  } else {
    numBansTextDate.innerHTML = "by " + sliderValueToMonthYear[curMonthYear] + " since July 2021";
  }
}

function hideToolTip() {
  var hoverBox = document.getElementById("toolTip");
  hoverBox.style.display = "none";
}
