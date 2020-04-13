import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef } from '@angular/core';

declare var d3      : any;
declare var topojson: any;

@Component(
    {
        selector: 'globe',
        template: `<div style="text-align: center; margin-top: 20px;"></div>`
    })
export class Globe implements AfterViewInit
{
    constructor(
        private _el  : ElementRef,
        private _http: HttpClient,
        )
    {
    }

    ngAfterViewInit(): void
    {
        let div = <HTMLDivElement>this._el.nativeElement.firstChild;

        const width = 960;
        const height = 500;
        const config = {
            speed: 0.005,
            verticalTilt: -30,
            horizontalTilt: -30
        }

        const svg = d3.select(div)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        var projection = d3.geoOrthographic();
        //projection = projection.scale(200);
        console.log(projection.scale());
        const path = d3.geoPath().projection(projection);

        this._http.get("world-110m.json").subscribe(
            (worldData: any) =>
        {
                svg.selectAll(".segment")
                    .data(topojson.feature(worldData, worldData.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("class", "country")
                    .attr("d", path);

                const graticule = d3.geoGraticule();

                svg.append("path")
                    .datum(graticule)
                    .attr("class", "graticule")
                    .attr("d", path)
                    .style("fill", "none");

                d3.timer(elapsed =>
                {
                    projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
                    svg.selectAll("path").attr("d", path);
                });
        });
    }
}
