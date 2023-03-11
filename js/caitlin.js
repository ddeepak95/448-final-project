// import counts from '../data/state-district-ban-counts.csv'
// import us from '../data/states-albers-10m.json'
// import {legend} from "https://api.observablehq.com/@d3/color-legend.js?v=3";

let num_bans_per_state;
let num_banning_districts;
let us;

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
    })


// d3.csv("../data/state-district-ban-counts.csv")
//     .then(data => { 
//         num_bans_per_state = new Map(data.map(state => [state.state, +state.total_bans]))
//         num_banning_districts = new Map(data.map(state => [state.state, +state.num_districts]))
//         console.log(num_bans_per_state)
//         console.log(num_banning_districts)
//     })


function onReady() {
const color = d3.scaleLinear().domain([0, 900]).range(["#f0adae", "#e15759"])
const commaFormat = d3.format(",")
const path = d3.geoPath()


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
