var canvas;

var delta = [ 0, 0 ];
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
getBrowserDimensions();

var worldAABB, world, iterations = 1, timeStep = 1 / 20;

var walls = [];
var wall_thickness = 200;
var wallsSetted = false;

var bodies, elements, text;

var isMouseDown = false;
var mouseJoint;
var mouseX = 0;
var mouseY = 0;
var orientation = { x: 0, y: 1 };

var PI2 = Math.PI * 2;

var timeOfLastTouch = 0;

init();
play();

function init() {

  canvas = document.getElementById( 'canvas' );

  document.onmousedown = onDocumentMouseDown;
  document.onmouseup = onDocumentMouseUp;
  document.onmousemove = onDocumentMouseMove;
  document.ondblclick = onDocumentDoubleClick;

  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'touchend', onDocumentTouchEnd, false );

  window.addEventListener( 'deviceorientation', onWindowDeviceOrientation, false );

  // init box2d

  worldAABB = new b2AABB();
  worldAABB.minVertex.Set( -200, -200 );
  worldAABB.maxVertex.Set( screen.width + 200, screen.height + 200 );

  world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

  setWalls();
  reset();
}


function play() {

  setInterval( loop, 1000 / 40 );
}

function reset() {
  var i;

  if ( bodies ) {
    for ( i = 0; i < bodies.length; i++ ) {

      var body = bodies[ i ]
      canvas.removeChild( body.GetUserData().element );
      world.DestroyBody( body );
      body = null;
    }
  }

  bodies = [];
  elements = [];

  createTrack()

  createTeam('#cc0000');
  createTeam('#0000cc');


}


function createTeam(teamColor) {
  var x,y, options = {}
  options.teamColor = teamColor;
  // console.log(stage)

  for( i = 0; i < 4; i++ ) {
    // x = 800 + Math.random() * 200;
    // y = Math.random() * stage[3];
    x = stage[2]/2.5 + (stage[2] * 0.24 * Math.random());
    y = stage[3] * .9 - (stage[3] * 0.15 * Math.random());

    if (i == 1) { options.role = 'pivot' } else { options.role = undefined }
    createBall(x, y, options);
  }
  options.role = 'jammer'
  createBall(stage[2]/2.6, stage[3] * .9 - (stage[3] * 0.2 * Math.random()) , options);
}


function onDocumentMouseDown() {
  isMouseDown = true;
  return false;
}

function onDocumentMouseUp() {
  isMouseDown = false;
  return false;
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function onDocumentDoubleClick() {
  reset();
}

function onDocumentTouchStart( event ) {
  if( event.touches.length == 1 ) {
    event.preventDefault();

    // Faking double click for touch devices

    var now = new Date().getTime();

    if ( now - timeOfLastTouch  < 250 ) {
      reset();
      return;
    }

    timeOfLastTouch = now;

    mouseX = event.touches[ 0 ].pageX;
    mouseY = event.touches[ 0 ].pageY;
    isMouseDown = true;
  }
}

function onDocumentTouchMove( event ) {
  if ( event.touches.length == 1 ) {
    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX;
    mouseY = event.touches[ 0 ].pageY;
  }
}

function onDocumentTouchEnd( event ) {
  if ( event.touches.length == 0 ) {
    event.preventDefault();
    isMouseDown = false;
  }
}

function onWindowDeviceOrientation( event ) {
  if ( event.beta ) {
    orientation.x = Math.sin( event.gamma * Math.PI / 180 );
    orientation.y = Math.sin( ( Math.PI / 4 ) + event.beta * Math.PI / 180 );
  }
}


function createStar(ctx, size) {
  var scale = size/1235;
  var offset = (1235 * 0.1) / 2
  scale = scale * 0.9;
  // offset = 200

  // console.log(scale)
  ctx.save();
  ctx.scale(scale, scale * 0.95)
  ctx.translate(offset, offset)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0,449);
  ctx.lineTo(1235,449);
  ctx.lineTo(236,1175);
  ctx.lineTo(618,0);
  ctx.lineTo(1000,1175);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};


function createPivot(ctx, size) {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0,size/2);
  ctx.lineTo(size, size/2);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};


function createTrack(ctx) {
  var element = document.createElement("canvas");
  element.width = stage[2];
  element.height = stage[3];
  element.style['position'] = 'absolute';
  element.style['left'] = 0;
  element.style['top'] = 0;

  canvas.appendChild(element);

  var ctx = element.getContext('2d');
  // ctx.translate(element.width/2,element.height/2)
  ctx.translate(stage[2]/2,stage[3]/2)


  ctx.fillStyle = '#cccccc';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;

  var scale = stage[2] / 120

  ctx.scale(scale,scale);

  ctx.beginPath();

  ctx.arc(-35/2, 0, 26.5, Math.PI * 1.5, Math.PI * .5, true);
  ctx.lineTo(-35/2,26.5)
  ctx.arc(35/2, 0, 26.5, Math.PI * .5, Math.PI * 1.5, true);

  ctx.moveTo(-35/2,11.5)
  ctx.arc(-35/2, -1, 12.5, Math.PI * .5, Math.PI * 1.5, false);
  ctx.lineTo(35/2,-11.5)
  ctx.arc(35/2, 1, 12.5, Math.PI * 1.5, Math.PI * .5, false);
  ctx.lineTo(-35/2,11.5)

  ctx.moveTo(-35/2,-26.5)
  ctx.lineTo(35/2,-26.5)

  ctx.closePath();

  ctx.lineWidth = 0.5;

  ctx.moveTo(35/2,13.5)
  ctx.lineTo(35/2,26.5)
  ctx.moveTo(-35/2+5,11.5)
  ctx.lineTo(-35/2+5,26.5)


  ctx.fill();
  ctx.stroke();
}

function createBall( x, y, options ) {
  var size = stage[2]/50;

  var element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  element.style['position'] = 'absolute';
  element.style['left'] = -200 + 'px';
  element.style['top'] = -200 + 'px';

  var ctx = element.getContext("2d");

  ctx.fillStyle = options.teamColor;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size/15;
  ctx.beginPath();
  ctx.arc(size * .5, size * .5, size * .45, 0, PI2, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (options.role == 'jammer') {
    createStar(ctx, size);
  }

  if (options.role == 'pivot') {
    createPivot(ctx, size);
  }

  canvas.appendChild(element);

  elements.push( element );

  var b2body = new b2BodyDef();

  var circle = new b2CircleDef();
  circle.radius = size >> 1;
  circle.density = 10000;
  circle.friction = 1.3;
  circle.restitution = 0;
  b2body.linearDamping = 1000;
  b2body.AddShape(circle);
  b2body.userData = {element: element};

  b2body.position.Set( x, y );
  // b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
  bodies.push( world.CreateBody(b2body) );
}

//

function loop() {

  if (getBrowserDimensions()) {
    setWalls();
  }

  delta[0] += (0 - delta[0]) * .5;
  delta[1] += (0 - delta[1]) * .5;

  // world.m_gravity.x = orientation.x * 350 + delta[0];
  // world.m_gravity.y = orientation.y * 350 + delta[1];

  mouseDrag();
  world.Step(timeStep, iterations);

  for (i = 0; i < bodies.length; i++) {

    var body = bodies[i];
    var element = elements[i];

    element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
    element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';
  }
}


// .. BOX2D UTILS

function createBox(world, x, y, width, height, fixed) {

  if (typeof(fixed) == 'undefined') {
    fixed = true;
  }

  var boxSd = new b2BoxDef();

  if (!fixed) {
    boxSd.density = 1.0;
  }

  boxSd.extents.Set(width, height);

  var boxBd = new b2BodyDef();
  boxBd.AddShape(boxSd);
  boxBd.position.Set(x,y);

  return world.CreateBody(boxBd);
}


function mouseDrag() {
  if (isMouseDown && !mouseJoint) {
    var body = getBodyAtMouse();

    if (body) {
      var md = new b2MouseJointDef();
      md.body1 = world.m_groundBody;
      // md.body1 = body;
      md.body2 = body;
      // console.log(body)
      md.target.Set(mouseX, mouseY);
      md.maxForce = 30000 * body.m_mass;
      // md.dampingRatio = 2;
      md.timeStep = timeStep;
      mouseJoint = world.CreateJoint(md);
      body.WakeUp();
    }
  }

  // mouse release
  if (!isMouseDown) {
    if (mouseJoint) {
      // console.log(mouseJoint);
      world.DestroyJoint(mouseJoint);
      mouseJoint = null;
    }
  }

  // mouse move
  if (mouseJoint) {
    var p2 = new b2Vec2(mouseX, mouseY);
    mouseJoint.SetTarget(p2);
  }
}

function getBodyAtMouse() {
  // Make a small box.
  var mousePVec = new b2Vec2();
  mousePVec.Set(mouseX, mouseY);

  var aabb = new b2AABB();
  aabb.minVertex.Set(mouseX - 1, mouseY - 1);
  aabb.maxVertex.Set(mouseX + 1, mouseY + 1);

  // Query the world for overlapping shapes.
  var k_maxCount = 10;
  var shapes = new Array();
  var count = world.Query(aabb, shapes, k_maxCount);
  var body = null;

  for (var i = 0; i < count; ++i) {
    if (shapes[i].m_body.IsStatic() == false) {
      if ( shapes[i].TestPoint(mousePVec) ) {
        body = shapes[i].m_body;
        break;
      }
    }
  }
  return body;
}

function setWalls() {
  if (wallsSetted) {

    world.DestroyBody(walls[0]);
    world.DestroyBody(walls[1]);
    world.DestroyBody(walls[2]);
    world.DestroyBody(walls[3]);

    walls[0] = null;
    walls[1] = null;
    walls[2] = null;
    walls[3] = null;
  }

  walls[0] = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
  walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
  walls[2] = createBox(world, - wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
  walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]);

  wallsSetted = true;

}

// BROWSER DIMENSIONS

function getBrowserDimensions() {

  var changed = false;

  if (stage[0] != window.screenX) {
    delta[0] = (window.screenX - stage[0]) * 50;
    stage[0] = window.screenX;
    changed = true;
  }

  if (stage[1] != window.screenY) {
    delta[1] = (window.screenY - stage[1]) * 50;
    stage[1] = window.screenY;
    changed = true;
  }

  if (stage[2] != window.innerWidth) {
    stage[2] = window.innerWidth;
    changed = true;
  }

  if (stage[3] != window.innerHeight) {
    stage[3] = window.innerHeight;
    changed = true;
  }

  return changed;
}
