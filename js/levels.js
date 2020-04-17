// LEVEL CONSTANT PROPERTIES
const PROBABILITY = {
  TRAP : 0.05,
  LEVEL: 0.9
}

const TILE = {
  AIR : 0,
  FLOOR : 1,
  TRAP : 2,
  TRAP_THIN : 3,
  TRAP_FLOOR : 4,
  TRAP_CEILING : 5
}

/*
Thesis on Level Design:
Cause of the game being continuous the level cannot be static unless we made some form of "single player" or "level" game mode which may be possible later.
Therefore, the level design will be a consistent dynamic structure of objects.
Top doggy is the stage which will contain a 2D array forming a grid structure where each item in the grid will be a tile.
The grid will consist of a pre-determined number of rows (currently set at 3) and a set length (12). ** potentially make the stages a dynamic length
The length of the stage will be >> the displayed scene.
Because of this concept, only 2 stages will be held in memory at one time.
Once the player moves out of the current stage, they will not be able to go back to it.
The system can then destroy the now "previous" stage and pop it off the list of stages and append a newly generated stage.

Each stage will be made from tiles.
Tiles are smaller elements of the stage. My current design will randomly generate a design for the player to travers.
The tiles will each consist as a combination of a number of things. These will be made of some preset types like minecraft blocks.
I.e. Air, Flat level with floor, floor with electric trap, lava floor, floor with boxes stacked, floor and ceiling, floor and ceiling with spikes
This will help level make level generation easier by allowing selection from a preset, "confirmed" good set of tiles
Will also allow for more ranged positioning of traps within the local space of the tile before translating all objects in the tile's scene to the stages coordinate space.

Stage will then be positioned in the world space according to time and the user's movement.

First attempt will use random selection of tiles according to some game logic rules
*/

// top left corner of tile is the ORIGIN
class Tile extends Base_Object {

  // id is enumerated tile type; dimensions(width & height) in world space
  constructor( dimensions, pos, id) {
    super( dimensions, pos, "tile_" + id.toString() + "_x" + pos[0].toString() + "y" + pos[1].toString() );
    this.objects = [];
    switch (id) {
      // check enumerated TILE types for coresponding type
      case 0:
        break;
      case 1:
        this.objects.push(new Base_Static([this.dimensions.w, this.dimensions.h / 8], [0, 7 * this.dimensions.h / 8 ], "static_floor", COLOURS.LGREY, false));
        break;
      case 2:
        this.objects.push(new Base_Static([this.dimensions.w, this.dimensions.h / 8], [0, 7 * this.dimensions.h / 8 ], "static_floor", COLOURS.LGREY, false));
        this.objects.push(new Base_Static([this.dimensions.w / 2, this.dimensions.h / 8], [this.dimensions.w / 4, 3 * this.dimensions.h / 4 ], "static_floor", COLOURS.LGREY, true));
        break;
      case 3:
        this.objects.push(new Base_Static([this.dimensions.w, this.dimensions.h / 8], [0, 7 * this.dimensions.h / 8 ], "static_floor_trap", COLOURS.RED, true));
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
    }
  }

  render(graphics, origin) {
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].render(graphics, origin);
    }
  }

  kill() {
    delete this.objects;
    this.objects = [];
  }
}


class Stage extends Base_Object {
  constructor(dimensions = [0,0], pos = [0, 0], type = "stage", cols = 6, rows = 3) {
    super(dimensions, pos, type);

    this.cols = cols;
    this.rows = rows;

    this.tiles = [];
    let col = [];   // what the fuck is 'col'
    let x = this.pos.x;
    let y = this.pos.y;
    let t;

    // how is this orientated ?? please comment in :)
    let grid = [
      [1, 1, 1],
      [1, 2, 1],
      [0, 0, 0],
      [1, 2, 1],
      [1, 0, 0],
      [3, 3, 1]
    ];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        t = new Tile([this.dimensions.w / cols, this.dimensions.h / rows], [x, y], grid[i][j]);
        col.push(t);
        y += this.dimensions.h / rows;
      }
      this.tiles.push(col);
      x += this.dimensions.w / cols;
      y = 0;
      col = [];
    }
  }

  render(graphics) {
    for (let i = 0; i < this.tiles.length; i++) {
      let col = this.tiles[i];
      for (let j = 0; j < col.length; j++) {
        col[j].render(graphics, col[j].pos);
      }
    }
  }
}


// level object will contain a list of stages
// Each will have an ID refering to what level it is
// "-1" id denotes an enless level.
// Only implementing the endless level for now but will leave room to make static levels in the future
class Level extends Base_Object {
  constructor(dimensions = [0,0], pos = [0,0], type = "level", id = -1) {
    super(dimensions, pos, type);
    if (id == -1) { this.type += "_endless"; }
    else { this.type += "_static"; }
    this.id = id;
    this.stages = [];
    this.stages.push(new Stage( [g.renderer.domElement.width, g.renderer.domElement.height], [0, 0], "test_stage", 6, 3 ));
  }

  // Use to append or pop stages from the list according to the player position
  update(player) {
    // If static then leave
    if (this.id != -1) { return ; }
  }

  // Move function as the level moves not the player
  move() {

  }

  render(graphics) {
    for (let i = 0; i < this.stages.length; i++) {
      this.stages[i].render(graphics);
    }
  }

  // Get list of stages the player is in
  // Min 1
  // Max 2
  // Used in getTiles
  getStages(left, right, up, down) {
    let s = [];
    let l, r;
    for (let i = 0; i < this.stages.length; i++) {
      l = this.stages[i].getLeft();
      r = this.stages[i].getRight();

      // Check which stage(s) left and right are in
      if (left > l && left < r && right > l && right < r) {
        s.push(this.stages[i]);
        return;
      } else if (left > l && left) {
        s.push(this.stages[i]);
        continue;
      } else if (right > l && right < r) {
        s.push(this.stages[i]);
        return;
      }
    }
    return s;
  }

  getTiles(left, right, up, down) {
    let s = getStages(left, right, up, down);
    let t, cols, rows = [];
    let l, r, u, d, stage, n_cols, n_rows;
    for (stage in s) {
      // Check tile layout
      if (stage.cols == 0 || stage.rows == 0) { continue; }

      // Adjust coordinate space
      l = left - stage.getLeft();
      r = right - stage.getRight();
      u = up - stage.getUp();
      d = down - stage.getDown();

      // Use integer division to check row/col
      let l_col = l / (stage.dimensions.w / stage.cols);
      let r_col = r / (stage.dimensions.w / stage.cols);
      let u_row = u / (stage.dimensions.h / stage.rows);
      let d_row = d / (stage.dimensions.h / stage.rows);

      // row indexes for defined area of stage
      if (u_row >= stage.rows || d_row >= stage.rows) {
        alert("player outside of stage row limit ?!");
        return t;
      } else if (u_row == d_row) {
        rows.push(u_row);
      } else {
        rows.push(u_row);
        rows.push(d_row);
      }

      // column indexes for defined area of stage
      if (l < 0) {
        cols.push(r_col);
      } else if (r > stage.dimensions.w) {
        cols.push(l_col);
      } else if (l_col == r_col) {
        cols.push(l_col);
      } else {
        cols.push(l_col);
        cols.push(r_col);
      }

      for (let i = 0; i < cols.length; i++) {
        for (let j = 0; j < rows.length; j++) {
          t.push(stage.tiles[i][j]);
        }
      }
    }
    return t;
  }

}
