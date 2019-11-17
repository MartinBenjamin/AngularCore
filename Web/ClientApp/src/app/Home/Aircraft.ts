import { Component, AfterViewInit, ElementRef } from '@angular/core';

declare var d3: any;

@Component(
    {
        selector: 'aircraft',
        template: `<div style="text-align: center"></div>`
    })
export class Aircraft implements AfterViewInit
{
    constructor(
        private _el: ElementRef
        )
    {
    }

    ngAfterViewInit(): void
    {
        let div = <HTMLDivElement>this._el.nativeElement.firstChild;

        var width = 960,
            height = 500,
            margin = 20;

        var square_length = d3.min([width, height]) - 2 * margin;

        var x_scale = d3.scale.linear()
            .range([width / 2 - square_length / 2, width / 2 + square_length / 2]);

        var y_scale = d3.scale.linear()
            .range([height / 2 + square_length / 2, height / 2 - square_length / 2]);

        var z_scale = d3.scale.linear()
            .range([0, 1]);

        var camera = { inclination: Math.PI / 2, azimuth: 0, center: { x: 0, y: 0, z: 0 } };

        while(div.childNodes.length)
            div.removeChild(div.firstChild);

        let svg = d3.select(div).append('svg')
            .attr("width", width)
            .attr("height", height);

        var container = svg.append("g");


        // Taken From
        // https://bl.ocks.org/bricof/605a89923aaf6d529c1b6156f635877d
        function parse_obj_text(obj_file_text)
        {

            var obj_file_lines = obj_file_text.split("\n");

            var vertices = [];
            obj_file_lines.forEach(function(line)
            {
                if(line.startsWith("v "))
                {
                    var vs = line.split(/[ ]+/);
                    vertices.push({ x: +vs[1], y: +vs[2], z: +vs[3] });
                }
            });

            var faces = [];
            obj_file_lines.forEach(function(line)
            {
                if(line.startsWith("f "))
                {
                    var vs = line.split(/[ ]+/);
                    var o = vs.shift();
                    var f = [];
                    vs.forEach(function(v)
                    {
                        f.push(+v.split('/')[0]);
                    });
                    faces.push(f);
                }
            });

            var surfaces = [];
            var vertices_used = [];
            faces.forEach(function(f)
            {
                var surface = [];
                f.forEach(function(v)
                {
                    surface.push(vertices[v - 1]);
                    vertices_used.push(vertices[v - 1]);
                });
                surfaces.push(surface);
            });

            var vx = vertices_used.map(function(v) { return v.x; }),
                vy = vertices_used.map(function(v) { return v.y; }),
                vz = vertices_used.map(function(v) { return v.z; });

            var min = { x: d3.min(vx), y: d3.min(vy), z: d3.min(vz) };
            var max = { x: d3.max(vx), y: d3.max(vy), z: d3.max(vz) };

            var extents = [d3.min([min.x, min.y, min.z]), d3.max([max.x, max.y, max.z])];
            var center = { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2, z: (min.z + max.z) / 2 }

            return {
                vertices: vertices, faces: faces, surfaces: surfaces,
                extents: extents, center: center
            };
        }



        function translate_pt(pt, center)
        {
            return {
                x: pt.x - center.x,
                y: pt.y - center.y,
                z: pt.z - center.z
            };
        }

        function rotate_pt(pt, camera)
        {

            // first rotate around y-axis to the azimuth angle
            var xp2 = pt.x * Math.cos(camera.azimuth) - pt.z * Math.sin(camera.azimuth);
            var zp2 = pt.x * Math.sin(camera.azimuth) + pt.z * Math.cos(camera.azimuth);

            // then around the x axis to pi/2 minus the inclination angle
            var a = Math.PI / 2 - camera.inclination;
            var zp3 = zp2 * Math.cos(a) - pt.y * Math.sin(a);
            var yp3 = zp2 * Math.sin(a) + pt.y * Math.cos(a);

            return { x: xp2, y: yp3, z: zp3 };

        }

        function project_orthographic(surfaces, camera)
        {
            surfaces.forEach(function(points)
            {
                points.forEach(function(point)
                {

                    var point_t = translate_pt(point, camera.center);
                    var point_r = rotate_pt(point_t, camera);

                    point.px = point_r.x;
                    point.py = point_r.y;
                    point.pz = point_r.z;

                });
            });
            return surfaces;
        }

        function draw(surfaces)
        {

            var polygons = container.selectAll(".polygon")
                .data(surfaces);

            polygons.enter().append("path")
                .attr("class", "polygon");

            polygons
                .attr("d", function(datum)
                {
                    var d = datum.map(function(point)
                    {
                        return [x_scale(point.px), y_scale(point.py)];
                    });
                    return "M" + d.join("L") + "Z";
                });
        }

        function update(surfaces, camera)
        {
            surfaces = project_orthographic(surfaces, camera);
            draw(surfaces);
        }

        var surfaces;
        var obj;
        d3.text("cessna.obj", function(error, obj_file_text)
        {
            if(error) throw error;

            obj = parse_obj_text(obj_file_text);
            surfaces = obj.surfaces;
            var extreme = d3.max([Math.abs(obj.extents[0]), Math.abs(obj.extents[1])]);

            // set a custom starting position
            // by setting the properties of the camera object
            camera.center = {
                x: 1.0351724999999998,
                y: 0,
                z: 0
            }
            camera.azimuth = -1.046;
            camera.inclination = 1.9627963267948965;

            x_scale.domain([-extreme, extreme]);
            y_scale.domain([-extreme, extreme]);
            z_scale.domain([-extreme, extreme]);

            // manually set the range of the
            // x_scale and y_scale as well
            x_scale.range([25.05443972783297, 934.9455602721671]);
            y_scale.range([704.9455602721671, -204.94556027216703]);

            update(surfaces, camera)

        });

    }
}
