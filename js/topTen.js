const topTenData = [
    {title: "Gender Queer: A Memoir" , count: 41},
    {title: "All Boys Aren't Blue" , count: 29},
    {title: "Out of Darkness" , count: 24},
    {title: "The Bluest Eye" , count: 22},
    {title: "The Hate U Give" , count: 17},
    {title: "Lawn Boy" , count: 17},
    {title: "The Absolutely True Diary of a Part-Time Indian" , count: 16},
    {title: "Me and Earl and the Dying Girl" , count: 14},
    {title: "l8r, g8r" , count: 12},
    {title: "Thirteen Reasons Why" , count: 12}
]


function initializeElements() {
const margin = ({top: 40, right: 20, bottom: 40, left: 240})
const svgWidth = 800 
const svgHeight = 400 
const width = svgWidth - margin.left - margin.right
const height = svgHeight - margin.top - margin.bottom

const topTenChart = d3.select("#topTenBarChart")
topTenChart.attr("width", svgWidth);
topTenChart.attr("height", svgHeight);


const xScale = d3.scaleLinear() 
.domain([0, d3.max(topTenData, d => d.count)])  
.range([0, width])
    
// add x-axis
topTenChart.append("g") // append group to svg
    .attr('transform', `translate(${margin.left}, ${height + margin.top})`) // offset starting point of x axis  to the right and down from the top by height + margin value
    .call(d3.axisBottom(xScale)).selectAll("text")
    .style("text-anchor", "end")
    .style("font-size", 10);

const yScale = d3.scaleBand()
.domain(topTenData.sort((a, b) => d3.descending(a.count, b.count)).reverse().map(d => d.title)) // sort by descending frequency
.range([height, 0])
.padding(0.1);


// add x-axis title
topTenChart.append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", svgHeight)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Total Bans");
    

// draw the rectangles here
    const barGroup2 = topTenChart.append("g") // create a group to keep the bars
    .attr("class", "barGroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); // shift all bars by the margin offset

    barGroup2.selectAll("rect")
    .data(topTenData)
    .join("rect")
    .attr("x", d => xScale(0))
    .attr("y", d => yScale(d.title))
    .attr("width", d => xScale(d.count) )
    .attr("height", yScale.bandwidth()) //
    .attr("fill", "#ed937e")

    // add add y-axis
    topTenChart.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale));
    
}



initializeElements();

