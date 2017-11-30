class Plots {
    constructor(data, colorKeys, colorScale) {
        this.data = data;
        this.colorKeys = colorKeys;
        this.colorScale = colorScale;

        // initializes the svg elements required for this chart
        this.margin = {top: 20, right: 20, bottom: 100, left: 75};

        this.plotIds = ["#plot-1", "#plot-2", "#plot-3",
            "#plot-4"];

        d3.select(".visualization")
            .attr("style", "height: " + ((window.innerHeight - 75) / 2) + "px;");
    }

    update(selectedTargets) {
        let plot1Targets = selectedTargets[this.plotIds[0]];
        let plot2Targets = selectedTargets[this.plotIds[1]];
        let plot3Targets = selectedTargets[this.plotIds[2]];
        let plot4Targets = selectedTargets[this.plotIds[3]];

        let plot1Data = [];
        for (let i = 0; plot1Targets && i < plot1Targets.length; i++) {
            plot1Data.push({
                "target": plot1Targets[i],
                "data":   this.data[plot1Targets[i]]
            });
        }

        let plot2Data = [];
        for (let i = 0; plot2Targets && i < plot2Targets.length; i++) {
            plot2Data.push({
                "target": plot2Targets[i],
                "data":   this.data[plot2Targets[i]]
            });
        }

        let plot3Data = [];
        for (let i = 0; plot3Targets && i < plot3Targets.length; i++) {
            plot3Data.push({
                "target": plot3Targets[i],
                "data":   this.data[plot3Targets[i]]
            });
        }

        let plot4Data = [];
        for (let i = 0; plot4Targets && i < plot4Targets.length; i++) {
            plot4Data.push({
                "target": plot4Targets[i],
                "data":   this.data[plot4Targets[i]]
            });
        }

        this.clearPlots();
        this.buildPlot(this.plotIds[0], plot1Data);
        this.buildPlot(this.plotIds[1], plot2Data);
        this.buildPlot(this.plotIds[2], plot3Data);
        this.buildPlot(this.plotIds[3], plot4Data);
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

    buildPlot(plotId, targets) {
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
