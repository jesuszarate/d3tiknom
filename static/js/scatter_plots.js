class Plots {
    constructor(data, colorKeys, colorScale) {
        this.data = data;
        this.colorKeys = colorKeys;
        this.colorScale = colorScale;

        // initializes the svg elements required for this chart
        this.margin = {top: 20, right: 20, bottom: 100, left: 75};

        this.plotIds = ["#dot-plot-1", "#dot-plot-2", "#dot-plot-3",
            "#dot-plot-4"];

        d3.select(".visualization")
            .attr("style", "height: " + ((window.innerHeight - 75) / 2) + "px;");
    }

    update(selectedTargets) {
        let dot1Targets = selectedTargets[this.plotIds[0]];
        let dot2Targets = selectedTargets[this.plotIds[1]];
        let dot3Targets = selectedTargets[this.plotIds[2]];
        let dot4Targets = selectedTargets[this.plotIds[3]];

        let dot1Data = [];
        for (let i = 0; dot1Targets && i < dot1Targets.length; i++) {
            dot1Data.push({
                "target": dot1Targets[i],
                "data":   this.data[dot1Targets[i]]
            });
        }

        let dot2Data = [];
        for (let i = 0; dot2Targets && i < dot2Targets.length; i++) {
            dot2Data.push({
                "target": dot2Targets[i],
                "data":   this.data[dot2Targets[i]]
            });
        }

        let dot3Data = [];
        for (let i = 0; dot3Targets && i < dot3Targets.length; i++) {
            dot3Data.push({
                "target": dot3Targets[i],
                "data":   this.data[dot3Targets[i]]
            });
        }

        let dot4Data = [];
        for (let i = 0; dot4Targets && i < dot4Targets.length; i++) {
            dot4Data.push({
                "target": dot4Targets[i],
                "data":   this.data[dot4Targets[i]]
            });
        }

        this.clearPlots();
        this.buildDotPlot(this.plotIds[0], dot1Data);
        this.buildDotPlot(this.plotIds[1], dot2Data);
        this.buildDotPlot(this.plotIds[2], dot3Data);
        this.buildDotPlot(this.plotIds[3], dot4Data);
    }

    clearPlots() {
        this.plotIds.forEach(function(plotId) {
            let data = d3.select(plotId)
                .select(".data");
            data.selectAll("line").remove();
            data.selectAll("text").remove();

            let xaxis = d3.select(plotId)
                .select(".x-axis");
            xaxis.selectAll("path").remove();
            xaxis.selectAll("g").remove();

            let yaxis = d3.select(plotId)
                .select(".y-axis");
            yaxis.selectAll("path").remove();
            yaxis.selectAll("g").remove();
        });
    }

    buildDotPlot(plotId, targets) {
        if (targets.length == 0) {
            return;
        }

        let plotSvg = d3.select(plotId);
        let computedSize = plotSvg.node().getBoundingClientRect();
        let width = computedSize.width - this.margin.left -
            this.margin.right;
        let height = computedSize.height - this.margin.top -
            this.margin.bottom;

        plotSvg.select(".svg-plot").attr("transform", "translate(" +
            this.margin.left + "," + this.margin.top + ")");

        // create the x and y scales
        let xScale = d3.scaleBand()
            .domain(targets.map((_, i) => i))
            .range([0, width])
            .padding(1.0);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(targets, t => d3.max(t.data, e => e[0]))])
            .rangeRound([height, 0]);

        // create the axes
        plotSvg.select(".svg-plot").select(".x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat((i) =>
                    nameFromTarget(targets[i].target)))
          .selectAll("text")
            .attr("transform", "rotate(-15)")
            .attr("x", -5)
            .attr("y", 20)
            .attr("dy", 0)
            .attr("text-anchor", "end");

        plotSvg.select(".svg-plot").select(".y-axis")
            .call(d3.axisLeft(yScale).ticks(10));

        plotSvg.select(".data")
            .selectAll("line")
            .data(targets)
            .enter()
            .append("line")
            .attr("x1", (_, i) => xScale(i))
            .attr("x2", (_, i) => xScale(i))
            .attr("y1", yScale(0))
            .attr("y2", (d) => yScale(d.data[d.data.length - 1][0]))
            .attr("stroke-width", 20)
            .attr("stroke", (d) => this.colorScale(
                    this.colorKeys.data[gubbinFromTarget(d.target)]));

        plotSvg.select(".data")
            .selectAll("text")
            .data(targets)
            .enter()
            .append("text")
            .style("fill", "#fff")
            .attr("x", (_, i) => xScale(i) - 10)
            .attr("y", (d) => yScale(0) - 5)
            .text((d) => d.data[d.data.length - 1][0]);
    }
}
