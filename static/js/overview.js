class Overview {

    /**
     * Initializes the svg elements required to lay the tiles
     * and to populate the legend.
     */
    constructor(data) {

        let divTiles = d3.select("#tiles").classed("content", true);
        this.margin = {top: 100, right: 100, bottom: 200, left: 100};
        let svgBounds = divTiles.node().getBoundingClientRect();
        this.svgWidth = svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgWidth;

        this.padding = 100;
        this.min_padding = 100;
        this.max_padding = 500;

        this.svg = divTiles.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            .attr("transform", "translate(" + this.margin.left + ",0)");

        this.tipWindowOpen = false;
        this.tiledatapoints = ["successes", "failures",
            "success_times_count", "success_times_sum", "success_times_max", "success_times_rmax", "success_times_min",
            "val", "total", "errors", "high", "highwater", "lowwater", "low",
            "sum", "count", "avg", "min", "max"];
        this.bubbledatapoints = ["total", "high", "low", "sum", "count", "avg", "min", "max"];
        this.getData(data);
    };

    getData(data) {
        this.data = new dataTable(data);
        this.tileData = [];
        Object.keys(this.data).forEach(function (d) {
            let labelArr = d.split(".");
            let label = labelArr[labelArr.length - 3];
            let path = "";
            labelArr.forEach(function (d, i) {
                if (i >= labelArr.length - 2) {
                    return;
                }
                path += d + ".";
            });
            path = path.substring(0, path.length - 1);

            let tileData = this.tileData;
            let index = 0;
            let point = this.tileData.find(function (d1, i) {
                let l = d.indexOf(d1["gubbin"]) > -1;
                index = i;
                return l;
            });

            if (point === undefined) {
                point = {
                    "gubbin": label,
                    "path": path,
                    "attr": {}
                };
                this.tileData.push(point);
            }

            this.tiledatapoints.forEach(function (dataname) {
                if (d.indexOf("." + dataname) > -1) {
                    let datapoint = this.data[d];
                    this.tileData[index].attr[dataname] = datapoint[datapoint.length - 1][0]
                }
            }, this);

        }, this);
    }

    tooltip_render(tooltip_data, display_data) {
        let text = "<h2 >" + tooltip_data.gubbin + "</h2>";
        text += "<ul>";

        display_data.forEach(function (d) {
            if (tooltip_data.attr[d] !== undefined) {
                if (d === "successes") {
                    text += "<li class='successful'>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
                else if (d === "failures") {
                    text += "<li class='failure'>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
                else {
                    text += "<li>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
            }
        });
        text += "</ul>";

        if (this.tipWindowOpen) {
            text +=

                '<button class="btn btn-primary btn-block dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                'View' +
                '  </button>\n' +
                '  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">' +

                "<form action=\"linechart.html\" method=\"GET\">" +
                '  <input type="hidden" name="gubbin" value="' + tooltip_data.path + '" />' +
                '  <button class="dropdown-item"><a>Linechart</a></button>' +
                "</form>" +

                "<form action=\"plots.html\" method=\"GET\">" +
                '  <input type="hidden" name="gubbin" value="' + tooltip_data.path + '" />' +
                '  <button class="dropdown-item btn-block">Plots</button>' +
                '  </div>' +
                "</form>";
        }

        return text;
    }

    update(type) {

        if (type === "tiles") {
            this.clearBubbles();
            this.drawTileVis();
        }
        else if (type === "bubble") {

            this.clearTiles();
            this.drawBubbleVis();
        }
    };

    drawTileVis() {

        this.maxColumns = 10;
        this.maxRows = 10;

        let len = Object.keys(this.tileData).length;

        let width = this.svgWidth / this.maxColumns;
        let height = this.svgHeight / this.maxRows;


        let tipMouseOver = d3.tip().attr('class', 'd3-tip')
            .direction('s')
            .offset(function () {
                return [0, 100];
            })
            .html((d) => {
                return this.tooltip_render(d, ref.tiledatapoints);
            });

        this.svg.selectAll("g").remove();

        let reference = this;
        let tile = this.svg.selectAll("g")
            .data(this.tileData);

        tile.exit().remove();

        let ref = this;
        let tileEnter = tile.enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + (i % 10) * width + "," + Math.floor(i / 10) * height + ")";
            }).attr("class", function (d) {
                return "tile";
            })
            .on("mouseover", function (d) {
                if (!ref.tipWindowOpen) {
                    tipMouseOver.show(d);
                }
            })
            .on("mouseleave", function (d) {
                if (!ref.tipWindowOpen) {
                    tipMouseOver.hide(d);
                }
            })
            .on("click", function (d) {
                ref.tipWindowOpen = true;
                tipMouseOver.show(d);
            })
            .on("dblclick", function (d) {
                tipMouseOver.hide();
                ref.tipWindowOpen = false;
            });

        tileEnter.call(tipMouseOver);

        this.drawTile(tileEnter, this.colorScale, height, width);
        tile.merge(tileEnter);
    }

    drawTile(tile, colorScale, height, width) {

        let ref = this;
        tile.append("rect")
            .attr("width", width)
            .style("fill", function (d) {
                return ref.scale(d);
            })
            .attr("height", height);


        let label = tile.append("text")
            .attr("y", 50)
            .attr("transform", function (d, i) {
                return "translate(100)";
            });

        let midX = height / 2;
        let midY = width / 2;

        label.append("tspan")
            .attr("x", 0)
            // .attr("x", midX + 50)
            // .attr("y", midY - 10)
            .style("font-size", function () {
                return (width * height) / 3000;
            })
            .text(function (d) {
                return d["gubbin"];
            })
            .attr("class", function (d) {
                return "tilestext";
            });
    }

    drawBubbleVis() {
        let ref = this;
        let nodes = [];

        nodes = this.tileData.filter(function (d) {
            return d.attr.total !== undefined;
        });
        nodes = nodes.map(function (d) {
            return {
                r: d.attr.total / 80,
                data: d
            };
        });
        nodes.unshift({r: 200});

        let root = nodes[0];
        let color = d3.scaleOrdinal().range(d3.schemeCategory20);

        root.radius = 0;
        root.fixed = true;

        const forceX = d3.forceX(this.svgWidth / 2).strength(0.015);
        const forceY = d3.forceY(this.svgHeight / 2).strength(0.015);

        let force = d3.forceSimulation()
            .velocityDecay(0.2)
            .force("x", forceX)
            .force("y", forceY)
            .force("charge", d3.forceManyBody())
            .force("collide", d3.forceCollide().radius(function (d) {
                if (d === root) {
                    return d.r;
                }
                return d.r + 0.5;

            }).iterations(5))
            .nodes(nodes).on("tick", ticked);


        let circle = this.svg.selectAll("circle")
            .data(nodes.slice(1))
            .enter().append("circle")
            .attr("r", function (d) {
                return d.r;
            })
            .style("fill", function (d, i) {
                if (d !== root) {
                    return color(i % 3);
                }
            });

        let tipMouseOver = d3.tip().attr('class', 'd3-tip')
            .direction('s')
            .offset(function () {
                return [0, 100];
            })
            .html((d) => {
                return this.tooltip_render(d, ref.bubbledatapoints);
            });

        function ticked() {
            circle
                .attr("cx", function (d) {
                    try {
                        return d.x;
                    }
                    catch (_) {
                    }
                })
                .attr("cy", function (d) {
                    try {
                        return d.y;
                    }
                    catch (_) {
                    }
                })
                .on("mouseover", function (d) {
                    if (!ref.tipWindowOpen) {
                        tipMouseOver.show(d.data);
                    }
                })
                .on("mouseleave", function (d) {
                    if (!ref.tipWindowOpen) {
                        tipMouseOver.hide();
                    }
                })
                .on("click", function (d) {
                    ref.tipWindowOpen = true;
                    tipMouseOver.show(d.data);
                })
                .on("dblclick", function (d) {
                    tipMouseOver.hide();
                    ref.tipWindowOpen = false;
                });
        }

        circle.call(tipMouseOver);
    }

    scale(d) {

        let domain = [0, 100];
        let range = ["#860308", "#a50f15", "#de2d26", "#fb6a4a", "#fc9272", "#fcbba1", "#c6dbef", "#9ecae1", "#6baed6",
            "#3182bd", "#08519c", "#063e78"];

        let colorScale = d3.scaleQuantile()
            .domain(domain)
            .range(range);

        let successes = d.attr["successes"];
        let failures = d.attr["failures"];
        let total = d.attr["total"];
        if (total === undefined) {
            total = 1;
        }
        if (successes === undefined) {
            successes = 0;
        }
        if (failures === undefined) {
            failures = 0;
        }
        return (colorScale(((successes / total) * 100)));// - (failures/total)*100) ));
    }

    clearTiles() {
        this.svg.selectAll("g").remove();
    }

    clearBubbles() {
        this.svg.selectAll("circle").remove();
    }
}

