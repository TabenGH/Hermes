var GRAVITY = 9.8;
var AIR_RESIST = 200;
// deltas refer to movement PER SECOND and need to be multiplied by time delta.

class Base_Object {
  constructor(dimensions=[0,0], start_pos=[0,0], type="void") {
      this.pos = {x: start_pos[0], y:start_pos[1]}; // Top left corner of shape (if rect), otherwise centre.
      this.deltas = { dx: 0, dy: 0};
      this.dimensions = {w: dimensions[0], h: dimensions[1]};
      this.type=type;
      console.log("creating new object type: " + type);
  }

  render() {
    console.log("Error, base object class cannot be rendered.");
  }

  move() {
    this.pos.x += this.deltas.dx;
    this.pos.y += this.deltas.dy;
  }

  kill() {
    // graphically kill object
    console.log("rufus gettin deaded:)");
    delete this;
  }

};

class Base_Sprite extends Base_Object {
  constructor(dimensions=[0,0], start_pos=[0,0], type="sprite_base", colour = COLOURS.RED,
              lives=0, states={none: "none"}, mass=100, row=0, max_deltas = [10, 10]){
    super(dimensions, start_pos, type);
    this.colour = colour;
    this.mass = mass;
    this.colour = colour;
    this.lives = lives;
    this.states = states;
    this.row = row;
    this.max_deltas = {max_x : max_deltas[0], max_y : max_deltas[1]};
  }

  // draw routine
  render(graphics) {
    console.log("Drawing base sprite (issa rectangle)");
    graphics.drawRectangle(this.x, this.y, this.dimensions.width, this.dimensions.height, this.colour);
  }

  physics(){
    // f = mnu * m * g
    this.deltas.dx *= (1.1 - (this.mass / 300)); // friction -- IMPORTANT must override if mass <= 30kg
    // when player height is confirmed come back here and make it real-world ish
    this.deltas.dy = (this.mass * GRAVITY - AIR_RESIST) / this.mass;
  }

  move(all_objects=[]) {
    // sprites can't move into walls so legal move check needed
    this.physics()
    if (this.deltas.dx > this.max_deltas.max_x) this.deltas.dx = this.max_deltas.max_x;
    if (this.deltas.dy > this.max_deltas.max_y) this.deltas.dy = this.max_deltas.max_y;

    this.pos.x += this.deltas.dx;
    if (!this.legal_move(all_objects)){
      this.pos.x -= this.deltas.dx;
      this.deltas.dx = 0;
    }
    this.pos.y += this.deltas.dy;
  }

  // only deals with rectangular objects -- implement SAT if need to deal with more complex shapes
    collided(object){
      if (this.pos.x < object.pos.x + object.dimensions.width &&
          this.pos.x + this.dimensions.width > object.pos.x &&
          this.pos.y < object.pos.y + object.dimensions.height &&
          this.pos.y + this.dimensions.height > object.y) {
            return true;
      } else{
          return false;
        }
    }

  // checks no collision occurs as result of move
    legal_move(objects=[]){
      objects.forEach((item, i) => {
        if (collided(item)){
          return false
        }
      });
      return true
    }

};

class Base_Static extends Base_Object {
  constructor(){
    // sort it out soom :)
    super();
  }
}
