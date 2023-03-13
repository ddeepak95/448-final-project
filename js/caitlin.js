let num_bans_per_state;
let num_banning_districts;
let us;
let state_districts;

d3.json('../data/states-albers-10m.json') 
    .then(data => { 
        us = data
        console.log(us)
        return d3.csv("../data/state-district-ban-counts.csv")

    })
    .then(data => { 
        num_bans_per_state = new Map(data.map(state => [state.state, +state.total_bans]))
        num_banning_districts = new Map(data.map(state => [state.state, +state.num_districts]))
        onReady()
        console.log(num_bans_per_state)
        console.log(num_banning_districts)
        return d3.json('../data/district-breakdown.json')
    })
    .then(data => { 
        state_districts = data
        console.log(state_districts)
    })

function onReady() {
const color = d3.scaleLinear().domain([0, 900]).range(["#f2e3e1", "#e15759"])
const commaFormat = d3.format(",")
const path = d3.geoPath()

function getDistrictBreakdownTable (state_districts) {
    let districts = []
    for (let i = 0; i < state_districts.length; i++) {
        let district_name = Object.keys(state_districts[i])[0]
        let district_count = state_districts[i][district_name]
        districts.push({"District": district_name, "Number of Books": district_count})
        }
    return districts
}
function getDistrictBreakdownGraph(state_districts) {
    let districts = []
    for (let i = 0; i < state_districts.length; i++) {
        let district_name = Object.keys(state_districts[i])[0]
        let district_count = state_districts[i][district_name]
        districts.push({district: district_name, bans: district_count})
        }
    return districts
}


function drawBarChart (data, chartTitle) {
    const margin = ({top: 40, right: 20, bottom: 140, left: 100}) // save room for axis labels
    const svgWidth = 220 + data.length * 10
    const svgHeight = 400 
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    const barChart = d3.select("#districtbargraph")
    barChart.attr("width", svgWidth);
    barChart.attr("height", svgHeight);
    barChart.html("");
    
   
    console.log(data.sort((a, b) => d3.descending(a.bans, b.bans)))
    const xScale = d3.scaleBand() // useful for ordinal or categorical data
    .domain(data.sort((a, b) => d3.descending(a.bans, b.bans)).map(state => state.district)) // sort by descending frequency
    .range([0, width])
    .padding(0.2);
      
    // add x-axis
    barChart.append("g") // append group to svg
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`) // offset starting point of x axis  to the right and down from the top by height + margin value
      .call(d3.axisBottom(xScale)).selectAll("text")
      .attr("transform", "translate(-10,1)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-weight", "bold")
      .style("font-size", 8);
  
    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.bans)])  
    .range([height, 0]);  
  
    // add add y-axis
    barChart.append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(d3.axisLeft(yScale));
  
    // add chart title
    barChart.append("text")
      .attr("x", svgWidth / 2) // move to middle of canvas
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text(chartTitle);
    
    // add x-axis title
    barChart.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", svgHeight - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("District");
      
    
    // add y-axis title, remember that all transformations are around the (0, 0) origin
    barChart.append("text")
      .attr("x", -(margin.top + height / 2)) // move to center of lefthand side
      .attr("y", 15)
      .attr("transform", "rotate(-90)")  // rotate it by -90 degrees
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Number of Bans");
    
    // draw the rectangles here
     const barGroup = barChart.append("g") // create a group to keep the bars
      .attr("class", "barGroup")
      .attr("transform", `translate(${margin.left}, ${margin.top})`); // shift all bars by the margin offset
  
     barGroup.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => xScale(d.district))
      .attr("y", d => yScale(d.bans))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.bans)) //
      .attr("fill", "#ed937e")

  }

function stateName (name) {
    d3.select("state_text")
    .remove()
    var state_text = d3.select("#statename").append('state_text')
    .text(name)
    return state_text

}
function tabulate(data, columns) {
   
     d3.select("table")
            .remove()
	var table = d3.select('#district-table').append('table')
    if (data.length == 0) {
        table
        .text("No book bans!")
    }
    else {
        var thead = table.append('thead')
	    var	tbody = table.append('tbody');


        // append the header row
        thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
            .text(function (column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

        // create a cell in each row for each column
        var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
            return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
            .text(function (d) { return d.value; });

    }
	

  return table;
}



const callout14 = (g, value) => {
    if (!value) return g.style("display", "none"); 
    g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "14px sans-serif");
  
    const path = g.selectAll("path")
      .data([null])
      .join("path")
        .attr("fill", "white")
          .attr("opacity", ".95")
        .attr("stroke", "black"); 
    const text = g.selectAll("text")
      .data([null])
      .join("text")
      .call(text => text
        .selectAll("tspan")
        .data((value + "").split(/\n/))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.2}em`)
          .style("font-weight", (_, i) => i ? null : "bold")
          .text(d => d));
    const {x, y, width: w, height: h} = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  }


    const svg = d3.select("#map")
        .attr("viewBox", [0, 0, 975, 610]);

    // svg.append("g")
    //     .attr("transform", "translate(610,20)")
    //     .append(() => d3.legend({color, width: 260, height: 55}));

    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill", function(d){  return color(num_bans_per_state.get(d.properties.name))}
            )
        .attr("d", path)
        .append("title")

    svg.append("path") 
    const tooltip = svg.append("g");
    svg.selectAll("path")
        .on("click", function(d) {
            // tabulate(getDistrictBreakdownTable(state_districts[d.properties.name]), ['District', 'Number of Books'])
            // stateName(d.properties.name)
            if  (state_districts[d.properties.name].length != 0) {
                drawBarChart(getDistrictBreakdownGraph(state_districts[d.properties.name]), d.properties.name);         
            }
            else {
                d3.select("#districtbargraph").html("")
                d3.select("#districtbargraph").append("text")
                .attr("x", 10)
                .attr("y", 10)
                .text("No book bans!")
            }
              
            d3.selectAll(".map-highlighted-border").classed("map-highlighted-border", false)
            d3.select(this)
            .classed("map-highlighted-border", true)
            .raise();
        })
        .on("touchmove mousemove", function(d) { 
        tooltip.call(
            callout14, 
            `${d.properties.name} 
            Total # Bans: ${commaFormat(num_bans_per_state.get(d.properties.name))}
            # Banning Districts: ${commaFormat(num_banning_districts.get(d.properties.name))}`
        );
        tooltip.attr(
            "transform",
            `translate(${d3.mouse(this)[0]},${d3.mouse(this)[1]})`
        );
        d3.select(this)
            .classed("map-hovered-border", true)
            .raise();
        })
        .on("touchend mouseleave", function() {
        tooltip.call(callout14, null);
        d3.select(this)
        .classed("map-hovered-border", false)
        .lower();
        });
  
    }
