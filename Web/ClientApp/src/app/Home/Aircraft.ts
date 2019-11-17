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

        let width = 960,
            height = 500,
            margin = 20;

        let square_length = d3.min([width, height]) - 2 * margin;

        let x_scale = d3.scale.linear()
            .range([width / 2 - square_length / 2, width / 2 + square_length / 2]);

        let y_scale = d3.scale.linear()
            .range([height / 2 + square_length / 2, height / 2 - square_length / 2]);

        let z_scale = d3.scale.linear()
            .range([0, 1]);

        let camera = { inclination: Math.PI / 2, azimuth: 0, center: { x: 0, y: 0, z: 0 } };

        while(div.childNodes.length)
            div.removeChild(div.firstChild);

        let svg = d3.select(div).append('svg')
            .attr("width", width)
            .attr("height", height);

        let container = svg.append("g");


        // Taken From
        // https://bl.ocks.org/bricof/605a89923aaf6d529c1b6156f635877d
        function parse_obj_text(
            obj_file_text: string
            )
        {

            let obj_file_lines = obj_file_text.split("\n");

            let vertices = obj_file_lines
                .filter(line => line.startsWith("v "))
                .map(
                    line =>
                    {
                        let vs = line.split(/[ ]+/);
                        return { x: +vs[1], y: +vs[2], z: +vs[3] };
                    });

            let faces = obj_file_lines
                .filter(line => line.startsWith("f "))
                .map(
                    line =>
                    {
                        let vs = line.split(/[ ]+/);
                        vs.shift();
                        return vs.map(v => +v.split('/')[0]);
                    });

            let surfaces = [];
            let vertices_used = [];
            faces.forEach(function(f)
            {
                let surface = [];
                f.forEach(function(v)
                {
                    surface.push(vertices[v - 1]);
                    vertices_used.push(vertices[v - 1]);
                });
                surfaces.push(surface);
            });

            let vx = vertices_used.map(function(v) { return v.x; }),
                vy = vertices_used.map(function(v) { return v.y; }),
                vz = vertices_used.map(function(v) { return v.z; });

            let min = { x: d3.min(vx), y: d3.min(vy), z: d3.min(vz) };
            let max = { x: d3.max(vx), y: d3.max(vy), z: d3.max(vz) };

            let extents = [d3.min([min.x, min.y, min.z]), d3.max([max.x, max.y, max.z])];
            let center = { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2, z: (min.z + max.z) / 2 }

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
            let xp2 = pt.x * Math.cos(camera.azimuth) - pt.z * Math.sin(camera.azimuth);
            let zp2 = pt.x * Math.sin(camera.azimuth) + pt.z * Math.cos(camera.azimuth);

            // then around the x axis to pi/2 minus the inclination angle
            let a = Math.PI / 2 - camera.inclination;
            let zp3 = zp2 * Math.cos(a) - pt.y * Math.sin(a);
            let yp3 = zp2 * Math.sin(a) + pt.y * Math.cos(a);

            return { x: xp2, y: yp3, z: zp3 };

        }

        function project_orthographic(surfaces, camera)
        {
            surfaces.forEach(function(points)
            {
                points.forEach(function(point)
                {

                    let point_t = translate_pt(point, camera.center);
                    let point_r = rotate_pt(point_t, camera);

                    point.px = point_r.x;
                    point.py = point_r.y;
                    point.pz = point_r.z;

                });
            });
            return surfaces;
        }

        function draw(surfaces)
        {

            let polygons = container.selectAll(".polygon")
                .data(surfaces);

            polygons.enter().append("path")
                .attr("class", "polygon");

            polygons
                .attr("d", function(datum)
                {
                    let d = datum.map(function(point)
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

        d3.text("cessna.obj", function(error, obj_file_text)
        {
            if(error) throw error;

            let obj = parse_obj_text(obj_file_text);
            let surfaces = obj.surfaces;
            let extreme = d3.max([Math.abs(obj.extents[0]), Math.abs(obj.extents[1])]);

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
