const Grid = document.getElementById("sGrid")
const ObjsIn = document.getElementById("Obj")
const In = document.getElementById("objIn")

let objCount = 0

const gridSize = 75

Grid.style.gridTemplateRows = `repeat(${gridSize}, ${100 / gridSize}%)`
Grid.style.gridTemplateColumns = `repeat(${gridSize}, ${100 / gridSize}%)`

const focal = 140
let CubeVtx = [{ x: 25, y: -25, z: 25 }, { x: 25, y: -25, z: -25 }, { x: -25, y: -25, z: -25 }, { x: -25, y: -25, z: 25 }, { x: 25, y: 25, z: 25 }, { x: 25, y: 25, z: -25 }, { x: -25, y: 25, z: -25 }, { x: -25, y: 25, z: 25 }]

let CubeEdg = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [7, 4]]

let PyrVtx = [{ x: 15, y: -25, z: 15 }, { x: 15, y: -25, z: -15 }, { x: -15, y: -25, z: -15 }, { x: -15, y: -25, z: 15 }, { x: 0, y: 0, z: 0 }, { x: 15, y: 25, z: 15 }, { x: 15, y: 25, z: -15 }, { x: -15, y: 25, z: -15 }, { x: -15, y: 25, z: 15}]

let PyrEdg = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [5, 6], [6, 7], [7, 8], [8, 5], [5, 4], [6, 4], [7, 4], [8, 4]]

let Cube = { Vtx: CubeVtx, Edg: CubeEdg, Position: { x: 0, y: 0, z: 0 }, Rotation: { x: 0, y: 0, z: 0 } }
let Pyramid = { Vtx: PyrVtx, Edg: PyrEdg, Position: { x: 0, y: 0, z: 0 }, Rotation: { x: 0, y: 0, z:90 } }

let Obj = [Cube]

let VtxPrj = []

setInterval(() => {
    Obj[0].Rotation.y += .5
    //Obj[1].Rotation.x += .5
    Obj[0].Rotation.z += -.5
    //Obj[1].Rotation.z += -.5
    for (let i = 0; i < Obj.length; i++) {
        for (let j = 0; j < Obj[i].Frame.length; j++) {
            switch (Obj[i].Frame[j][0]) {
                case "p": {
                    Obj[i].Position[Obj[i].Frame[j][1]] += parseFloat(Obj[i].Frame[j].slice(3))
                    break
                }
                case "r": {
                    Obj[i].Rotation[Obj[i].Frame[j][1]] += parseFloat(Obj[i].Frame[j].slice(3))
                    break
                }
            }
        }
    }
    clear()
    render()
}, 50 / 3)

for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    var GridDiv = document.createElement("div")
    GridDiv.className = "cell"
    GridDiv.id = `${i}_${j}`
    Grid.appendChild(GridDiv)
  }
}

function render() {
  VtxPrj = []
  for (let i = 0; i < Obj.length; i++) {
    VtxPrj.push([]);
    for (let j = 0; j < Obj[i].Vtx.length; j++) {
      let tempVtx = { x: Obj[i].Vtx[j].x, y: Obj[i].Vtx[j].y, z: Obj[i].Vtx[j].z }
      for (let coord of ['x', 'y', 'z']) {
        tempVtx[coord] += Obj[i].Position[coord];
      }
      for (let coord of ['x', 'y', 'z']) {
        tempVtx = Rotate(coord, tempVtx, (Obj[i].Rotation[coord] * Math.PI / 180) % 360);
      }
      var x1 = parseInt((tempVtx.x * focal) / (tempVtx.z + focal))
      var y1 = parseInt((tempVtx.y * focal) / (tempVtx.z + focal))
      DrawPixel(x1 + Math.floor(gridSize / 2), -y1 + Math.floor(gridSize / 2), 1)
      VtxPrj[i].push({ x: x1 + Math.floor(gridSize / 2), y: -y1 + Math.floor(gridSize / 2) })
    }
  }
  DrawLines()
}

function clear() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      DrawPixel(i, j, 0)
    }
  }
}

function DrawLines() {
  for (let i = 0; i < Obj.length; i++) {
    for (let j = 0; j < Obj[i].Edg.length; j++) {
      //BresenHam Algorithm
      var P1 = VtxPrj[i][Obj[i].Edg[j][0]]
      var P2 = VtxPrj[i][Obj[i].Edg[j][1]]
      let y = P1.y, x = P1.x
      let Dx = Math.abs(P2.x - P1.x), Dy = Math.abs(P2.y - P1.y), S1 = Math.sign(P2.x - P1.x), S2 = Math.sign(P2.y - P1.y), Change = 0
      if (Dy > Dx) {
        let temp = Dx
        Dx = Dy
        Dy = temp
        Change = 1
      }
      let E = 2 * Dy - Dx, A = 2 * Dy, B = 2 * Dy - 2 * Dx
      DrawPixel(x, y, 1)
      for (let i = 0; i < Dx; i++) {
        if (E < 0) {
          if (Change == 1) {
            y += S2
          } else {
            x += S1
          }
          E += A
        } else {
          y += S2
          x += S1
          E += B
        }
        DrawPixel(x, y, 1)
      }
    }
  }
}

function Rotate(axis, coords, dgr) {
  const Matrix = [[Math.cos(dgr), -Math.sin(dgr)], [Math.sin(dgr), Math.cos(dgr)]]
  let temp, Rotated = []
  let x = 0, y = 0, z = 0
  switch (axis) {
    case "x": {
      x = coords.x
      temp = [coords.y, coords.z]
      break
    }
    case "y": {
      y = coords.y
      temp = [coords.x, coords.z]
      break
    }
    case "z": {
      z = coords.z
      temp = [coords.x, coords.y]
      break
    }
  }

  for (let i = 0; i < 2; i++) {
    Rotated[i] = 0
    for (let j = 0; j < 2; j++) {
      Rotated[i] += temp[j] * Matrix[j][i]
    }
  }

  switch (axis) {
    case "x": {
      return { x: x, y: Rotated[0], z: Rotated[1] }
    }
    case "y": {
      return { x: Rotated[0], y: y, z: Rotated[1] }
    }
    case "z": {
      return { x: Rotated[0], y: Rotated[1], z: z }
    }
  }
}

function DrawPixel(x, y, col) {
  if ((x >= 0 && x < gridSize) && (y >= 0 && y < gridSize)) {
    document.getElementById(`${y}_${x}`).style.background = col == true ? "white" : "none"
  }
}

In.addEventListener("change", getIn)

function getIn() {
    let ArrObjTemp = In.value.replaceAll(" ", "").split(";")
    Obj = []
    for (let i = 0; i < ArrObjTemp.length; i++) {
        if (ArrObjTemp[i] != "") {
            if (ArrObjTemp[i].toString()[0] == "{") {
                let TempObj = eval("(" + ArrObjTemp[i] + ")")
                let FinalObj = { Vtx: [], Edg: [], Position: { x: 0, y: 0, z: 0 }, Rotation: { x: 0, y: 0, z:0 }, Frame: []}
                for (let j = 0; j < TempObj.Vertex.length; j++) {
                    FinalObj.Vtx.push({x: TempObj.Vertex[j][0],y: TempObj.Vertex[j][1],z: TempObj.Vertex[j][2]})
                }
                for (let j = 0; j < TempObj.Edge.length; j++) {
                    FinalObj.Edg.push(TempObj.Edge[j])
                }
                let tempCords = ['x', 'y', 'z']
                for (let coord of tempCords) {
                    FinalObj.Position[coord] = TempObj.Position[tempCords.indexOf(coord)]
                    FinalObj.Rotation[coord] = TempObj.Rotation[tempCords.indexOf(coord)]
                }
                for (let j = 0; j < TempObj.Frame.length; j++) {
                    FinalObj.Frame.push(TempObj.Frame[j])
                }
                Obj.push(FinalObj)
            }
        }
    }
}
getIn()