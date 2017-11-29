class Plots {
    constructor(data, colorKeys, colorScale) {
        this.data = data;
        this.colorKeys = colorKeys;
        this.colorScale = colorScale;

        // initializes the svg elements required for this chart
        this.margin = {top: 20, right: 20, bottom: 200, left: 100};

        this.plotIds = ["#data-plot"];
    }

    update(selectedTargets) {
        let dataTargets = selectedTargets["#data-plot"];

        let dataData = [];
        for (let i = 0; dataTargets && i < dataTargets.length; i++) {
            dataData.push({
                "target": dataTargets[i],
                "data":   this.data[dataTargets[i]]
            });
        }

        this.clearPlots();
        this.buildDataPlot(dataData);
    }

    clearPlots() {
        this.plotIds.forEach(function(plotId) {
            let data = d3.select(plotId)
                .select(".data");
            data.selectAll("rect").remove();
            data.selectAll("circle").remove();
            data.selectAll("line").remove();
            data.selectAll("rect").remove();
            data.selectAll("polyline").remove();

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

    buildDataPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let ref = this;
        let plot = this.initializeSvgPlot("#data-plot", targets);
        targets.forEach(function(target, i) {
            let polylinePoints = "";
            target.data.forEach(function(d) {
                polylinePoints += plot.xScale(d[1]) + "," +
                    plot.yScale(d[0]) + " ";
            });

            let gubbin = gubbinFromTarget(target.target);

            // create the points
            let points = plot.svg.select(".data")
                .append("polyline")
                .attr("class", "gubbin-selected")
                .attr("stroke",
                    ref.colorScale(ref.colorKeys.data[gubbin]))
                .attr("points", polylinePoints);
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
        let xScale = d3.scaleLinear()
            .domain([d3.min(targets, d => d3.min(d.data, g => g[1])),
                    d3.max(targets, d => d3.max(d.data, g => g[1]))])
            .rangeRound([0, chartWidth]);

        let yScale = d3.scaleLinear()
            .domain([d3.max(targets, d => d3.max(d.data, g => g[0])),
                     d3.min(targets, d => d3.min(d.data, g => g[0]))])
            .rangeRound([0, chartHeight]);

        // create the axes
        plotSvg.select(".svg-plot").select(".x-axis")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(d3.axisBottom(xScale).tickFormat(function(i) {
                let date = new Date(i * 1000);
                return date.toGMTString();
            }))
          .selectAll("text")
            .attr("transform", "rotate(-15)")
            .attr("x", -5)
            .attr("y", 20)
            .attr("dy", 0)
            .attr("text-anchor", "end");

        plotSvg.select(".svg-plot").select(".y-axis")
            .call(d3.axisLeft(yScale).ticks(10));

        return {
            svg: plotSvg,
            width: chartWidth,
            height: chartHeight,
            xScale: xScale,
            yScale: yScale,
        };
    }
}
