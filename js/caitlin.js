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

function getDistrictBreakdown (state_districts) {
    let districts = []
    for (let i = 0; i < state_districts.length; i++) {
        let district_name = Object.keys(state_districts[i])[0]
        let district_count = state_districts[i][district_name]
        districts.push({"District": district_name, "Number of Books": district_count})
        }
    return districts
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
            tabulate(getDistrictBreakdown(state_districts[d.properties.name]), ['District', 'Number of Books'])
            stateName(d.properties.name)
            d3.select(this)
            .attr("stroke", "black")
            .raise();
        })
        .on("touchmove mousemove", function(d) { 
        tooltip.call(
            callout14, 
            `${d.properties.name} 
            Total # Bans: ${commaFormat(num_bans_per_state.get(d.properties.name))}
            # Banning Districts: ${commaFormat(num_banning_districts.get(d.properties.name))}`
            // ${getDistrictBreakdown(state_districts[d.properties.name])[0]} : ${getDistrictBreakdown(state_districts[d.properties.name])[1]} ` 
        );
        tooltip.attr(
            "transform",
            `translate(${d3.mouse(this)[0]},${d3.mouse(this)[1]})`
        );
        d3.select(this)
            .attr("stroke", "white")
            .raise();
        })
        .on("touchend mouseleave", function() {
        tooltip.call(callout14, null);
        d3.select(this)
            .attr("stroke", null)
            .lower();
        });
  
    }
