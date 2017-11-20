class Plots {
    constructor(plotIds, data) {
        this.data = data;

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};

        this.plotIds = plotIds;
    }

    update(selectedTargets) {
        let boxTargets = selectedTargets["#box-plot"];
        let stackTraceTargets = selectedTargets["#stack-trace-plot"];
        let comparisonTargets = selectedTargets["#comparison-plot"];
        let dotTargets = selectedTargets["#dot-plot"];

        let boxData = []
        for (let i = 0; i < boxTargets.length; i++) {
            boxData.push({
                "target": boxTargets[i],
                "data":   this.data[boxTargets[i]]
            });
        }

        let stackTraceData = []
        for (let i = 0; i < stackTraceTargets.length; i++) {
            stackTraceData.push({
                "target": stackTraceTargets[i],
                "data":   this.data[stackTraceTargets[i]]
            });
        }

        let comparisonData = []
        for (let i = 0; i < comparisonTargets.length; i++) {
            comparisonData.push({
                "target": comparisonTargets[i],
                "data":   this.data[comparisonTargets[i]]
            });
        }

        let dotData = []
        for (let i = 0; i < dotTargets.length; i++) {
            dotData.push({
                "target": dotTargets[i],
                "data":   this.data[dotTargets[i]]
            });
        }

        this.clearPlots();
        this.buildBoxPlot(boxData);
        this.buildStackTracePlot(stackTraceData);
        this.buildComparisonPlot(comparisonData);
        this.buildDotPlot(dotData);
    }

    clearPlots() {
        this.plotIds.forEach(function(plotId) {
            let data = d3.select(plotId)
                .select(".data");
            data.selectAll("rect").remove();
            data.selectAll("circle").remove();
            data.selectAll("line").remove();
            data.selectAll("rect").remove();
        });
    }

    buildBoxPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#box-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    buildStackTracePlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#stack-trace-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    buildComparisonPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#comparison-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    buildDotPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        console.log(targets);
        let plot = this.initializeSvgPlot("#dot-plot", targets);
        let target = targets[0].data;

        // create the bars
        let bars = plot.svg.select(".data")
            .selectAll("rect")
            .data(target);

        bars.exit()
            .attr("height", 0)
            .remove();

        let newBcSelection = bars.enter().append("rect");
        newBcSelection
            .transition()
            .duration(0)
            .attr("x", function(d) { return plot.xScale(d[1]); });

        let bcSelection = newBcSelection.merge(bars);
        bcSelection
            .attr("x", function (d) { return plot.xScale(d[1]); })
            .attr("y", function (d) { return plot.yScale(d[0]); })
            .attr("fill", "444")
            .attr("width", plot.xScale.bandwidth())
            .attr("height", function (d) {
                return plot.height - plot.yScale(d[0]);
            });
    }

    initializeSvgPlot(plotId, targets) {
        let plotSvg = d3.select(plotId);
        let computedSize = plotSvg.node().getBoundingClientRect();
        let chartWidth = computedSize.width - this.margin.left -
            this.margin.right;
        let chartHeight = computedSize.height - this.margin.top -
            this.margin.bottom;

        plotSvg.select(".svg-plot").attr("transform", "translate(" +
            this.margin.left + "," + this.margin.top + ")");

        // create the x and y scales; make sure to leave room for the axes
        let xScale = d3.scaleBand()
            .domain(targets.map((d) => d.data.map((g) => g[1])))
            .rangeRound([chartWidth, 0])
            .padding(0.1);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(targets, d => d3.max(d.data, g => g[0]))])
            .rangeRound([chartHeight, 0]);

        return {
            svg: plotSvg,
            width: chartWidth,
            height: chartHeight,
            xScale: xScale,
            yScale: yScale,
        };
    }
}
