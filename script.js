// Copyright (c) 2013, Taehoon Kim.
// Highly inspired by a solar system visualization of Dart project

var renderTime;
var fpsAverage;

var canvas, notes, context;
var width, height;

var centerPlanet;
var mercury, venus, earth, moon, jupiter, io, europa, ganymede, callisto, sun;

var drawPath = false;

var speedRatio = 1.0;

var zoom = 1.0;

function zoomIn() {
    drawBackground(context);
    zoom /= 2;
}

function zoomOut() {
    drawBackground(context);
    zoom *= 2;
}

function zoomDefault() {
    drawBackground(context);
    zoom = 1.0;
}

function speedUp() {
    drawBackground(context);
    speedRatio *= 2;
}

function speedDown() {
    drawBackground(context);
    speedRatio /= 2;
}

function speedDefault() {
    drawBackground(context);
    speedRatio = 1.0;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
};

function setCenterPlanet(planet) {
    drawBackground(context);
    centerPlanet = planet;
}

function drawBackground(context) {
    context.clearRect(0, 0, width, height);
}

function reverseDrawPath() {
    drawPath = !drawPath;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

window.onload = function(){ 
    canvas = document.getElementById("area");
    notes = document.getElementById("fps");
    context = canvas.getContext('2d');

    width = document.body.clientWidth;
    canvas.width = width;
    height = document.body.clientHeight;
    canvas.height = height;

    function normalizeOrbitRadius(r) {
        var radius = r * (width / 10.0 / zoom);
        return radius;
    };

    function normalizePlanetSize(r) {
        var size = Math.log(r + 1) * (width / 100.0 / zoom);
        return size;
    };

    function Planet (name, color, bodySize, orbitRadius, orbitPeriod) {
        this.addPlanet = function (planet) {
            this.planets.push(planet);
        };

    drawBackground(context);
        this.calculatePos = function (p) {
            if (drawPath)
                this.bodySize = 1 / zoom;
            else
                this.bodySize = normalizePlanetSize(bodySize);

            this.orbitRadius = normalizeOrbitRadius(orbitRadius);

            if (this.orbitSpeed == 0.0) {
                return p;
            }

            this.orbitSpeed = this.calculateSpeed(orbitPeriod);
            var angle = renderTime * this.orbitSpeed;
            var point = new Point(this.orbitRadius * Math.cos(angle) + p.x, this.orbitRadius * Math.sin(angle) + p.y);
            
            return point;
        };

        this.drawSelf = function(context, p) {
            if (p.x + this.bodySize < 0 || p.x - this.bodySize >= context.canvas.width) return;
            if (p.y + this.bodySize < 0 || p.y - this.bodySize >= context.canvas.height) return;

            context.lineWidth = 0.5;
            context.fillStyle = this.color;
            context.strokeStyle = this.color;

            if (this.bodySize >= 2.0) {
                context.shadowOffsetX = 2
                context.shadowOffsetY = 2
                context.shadowBlur = 2
                context.shadowColor = "#ddd";
            }

            context.beginPath()
            context.arc(p.x, p.y, this.bodySize, 0, Math.PI * 2, false)
            context.fill()
            context.closePath();

            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
            context.shadowBlur = 0;

            context.beginPath()
            context.arc(p.x, p.y, this.bodySize, 0, Math.PI * 2, false)
            context.fill()
            context.closePath()

            context.stroke();
        };

        this.draw = function (context, p) {
            var centerPos = centerPlanet.calculatePos(p);
            var pos = this.calculatePos(p);

            if (["moon", "io", "europa", "ganymede", "callisto"].indexOf(this.name) >= 0) {
                //notes.textContent = "pos.x : " +  moon.calculatePos(p).x + ", centerPos.x : " + pos.x + ", width/2 : " + (width/2);
            } else {
                pos.x -= centerPos.x - width/2;
                pos.y -= centerPos.y - height/2;
            }

            this.drawSelf(context, pos);
            this.drawChildren(context, pos);
        };

        this.drawChildren = function (context, p) {
            for (var i = 0; i < this.planets.length; i++) {
                this.planets[i].draw(context, p);
            }
        };

        this.calculateSpeed = function(period) {
            var speed =  period == 0.0 ? 0.0 : speedRatio * 1 / (60.0 * 24.0 * 2 * period);
            return speed;
        };

        this.name = name;
        this.color = color;
        this.bodySize = normalizePlanetSize(bodySize);
        this.orbitRadius = normalizeOrbitRadius(orbitRadius);
        this.orbitPeriod = orbitPeriod;
        this.orbitSpeed = this.calculateSpeed(orbitPeriod);
        this.planets = [];
    };

    function addAsteroidBelt(planet, count) {
        for (var i=0; i<count; i++) {
            var radius = 2.06 + Math.random() * (3.27 - 2.06);
            planet.addPlanet(new Planet("asteroidBelt", getRandomColor(), 
                0.1 * Math.random(), radius, radius * 2));
        }
    };

    mercury = new Planet("mercury", "orange", 0.382, 0.387, 0.241);
    venus = new Planet("venus", "green", 0.949, 0.723, 0.615);
    earth = new Planet("earth", "#33f", 1.0, 1.0, 1.0);
    moon = new Planet("moon", "gray", 0.2, 0.14, 0.075);
    earth.addPlanet(moon);

    var f = 0.1;
    var h = 1 / 1500.0;
    var g = 1 / 72.0;

    jupiter = new Planet("jupiter", "gray", 4.0, 5.203, 11.86);
    io = new Planet("io", getRandomColor(), 3.6*f, 421*h, 1.769*g);
    europa = new Planet("europa", getRandomColor(), 3.1*f, 671*h, 3.551*g);
    ganymede = new Planet("ganymede", getRandomColor(), 5.3*f, 1070*h, 7.154*g);
    callisto = new Planet("callisto", getRandomColor(), 4.8*f, 1882*h, 16.689*g);
    jupiter.addPlanet(io);
    jupiter.addPlanet(europa);
    jupiter.addPlanet(ganymede);
    jupiter.addPlanet(callisto);

    sun = new Planet("sun", "#ff2", 14.0, 0, 0);
    sun.addPlanet(mercury);
    sun.addPlanet(venus);
    sun.addPlanet(earth);
    sun.addPlanet(jupiter);
    addAsteroidBelt(sun, 350);

    function showFps(fps) {
      if (fpsAverage == null) fpsAverage = fps;
      fpsAverage = fps * 0.05 + fpsAverage * 0.95;
      notes.textContent = fpsAverage + " fps";
    }

    function draw() {
        var time = (new Date()).getTime();
        // if (renderTime != null) showFps(1000 / (time - renderTime));
        renderTime = time;

        if (!drawPath)
            drawBackground(context);

        drawPlanets(context);

        requestRedraw();
    }

    function drawBackground(context) {
        context.clearRect(0, 0, width, height);
    }

    function drawPlanets(context) {
        sun.draw(context, new Point(width / 2, height / 2));
    }

    function requestRedraw() {
        window.requestAnimationFrame(draw);
    }

    setCenterPlanet(sun);
    requestRedraw();
}
