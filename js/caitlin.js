import counts from '../data/state-district-ban-counts.csv'
import us from '../data/states-albers-10m.json'
import {legend} from "https://api.observablehq.com/@d3/color-legend.js?v=3";


const num_bans_per_state = Object.assign(new Map(d3.csvParse(await counts.text(), 
            ({state, total_bans}) => [state, +total_bans])), {title: "Number of Bans"})
const num_banning_districts = Object.assign(new Map(d3.csvParse(await counts.text(), ({state, num_districts}) => [state, +num_districts])))
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

export default function map {
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, 975, 610]);

    svg.append("g")
        .attr("transform", "translate(610,20)")
        .append(() => legend({color, title: num_bans_per_state.title, width: 260, height: 55}));

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
    return svg.node();
}
