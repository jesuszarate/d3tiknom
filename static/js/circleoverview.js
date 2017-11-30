class circleoverview {

    constructor(data) {

        this.padding = 100;
        this.min_padding = 100;
        this.max_padding = 500;

        let divCircles = d3.select("#bubbles").classed("content", true);
        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        let svgBounds = divCircles.node().getBoundingClientRect();
        this.width = svgBounds.width - this.margin.left - this.margin.right;
        this.height = this.width / 2;

        this.svg = divCircles.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate(" + this.margin.left + ",0)");

        this.datapoints = ["successes", "failures", "total", "errors", "high", "low", "sum", "count", "avg", "min", "max"];
        this.getData(data);
    }

    update() {
        let ref = this;

        let nodes = [];
        this.tileData.forEach(function (d, i) {
            if (d.attr.total !== undefined) {
                let data = {
                    id: i,
                    radius: d.attr.total / 300,
                    cx: ref.width / 2 + Math.random() * 150 ,
                    cy: ref.height / 2 + Math.random() * 150,
                    data: d
                };
                nodes.push(data);
            }
        });

        nodes.forEach(function (d) {
            d.x = d.cx;
            d.y = d.cy;
        });

        let circle = this.svg.selectAll("circle")
            .data(nodes);

        let enter_circle = circle.enter().append("circle")
            .attr('class', 'node');

        enter_circle
            .attr("r", function (d) {
                return d.radius;
            })
            .attr("cx", function (d) {
                return d.cx;
            })
            .attr("cy", function (d) {
                return d.cy;
            });

        let force = d3.layout.force()
            .nodes(nodes)
            .size([this.width, this.height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

        force.alpha(.05);

        function tick(e) {
            circle.each(gravity(.2 * e.alpha))
                .each(collide(.5))
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .on("mouseover", function (d) {
                    console.log(d.data);
                });
        }

        /*	SLIDER
        */
        let x = d3.scale.linear()
            .domain([this.min_padding, this.max_padding])
            .range([0, this.width])
            .clamp(true);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(10, 10)")
            .call(d3.svg.axis()
                .scale(x)
                .ticks(0)
                .tickSize(0))
            .select(".domain")
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "halo");

        let brush = d3.svg.brush()
            .x(x)
            .extent([0, 0])
            .on("brush", brushed);

        let slider = this.svg.append("g")
            .attr("class", "slider")
            .call(brush);

        slider.selectAll(".extent,.resize")
            .remove();

        let handle = slider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(10, 10)")
            .attr("r", 9);

        slider
            .call(brush.event);

        function brushed() {
            let value = brush.extent()[0];

            if (d3.event.sourceEvent) {
                value = x.invert(d3.mouse(this)[0]);
                brush.extent([value, value]);

                force.alpha(.01);
            }

            handle.attr("cx", x(value));

            ref.padding = value;
        }

        // Resolve collisions between nodes.
        function collide(alpha) {
            let quadtree = d3.geom.quadtree(nodes);
            return function (d) {
                if(ref.padding === 0){
                    ref.padding = 100;
                }
                let r = d.radius + ref.padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        let x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius + ref.padding;
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }

        //	Move nodes toward cluster focus.
        function gravity(alpha) {
            return function (d) {
                d.y += (d.cy - d.y) * alpha;
                d.x += (d.cx - d.x) * alpha;
            };
        }
    }

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

            this.datapoints.forEach(function (dataname) {
                if (d.indexOf("." + dataname) > -1) {
                    let datapoint = this.data[d];
                    this.tileData[index].attr[dataname] = datapoint[datapoint.length - 1][0]
                }
            }, this);

        }, this);
    }
}
