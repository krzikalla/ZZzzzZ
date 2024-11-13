function diceroll()
{
  return Math.floor(Math.random() * 6);
}

function rerollId(id)
{
  const element_names = ["Fire", "Water", "Air", "Earth", "Wisdom", "Power"];
  let element = document.getElementById(id);
  element.dataset["value"] = diceroll();
  element.src = "img/" + element_names[element.dataset["value"]] + ".png";
}

function getElementIndexForId(id)
{
  let element = document.getElementById(id);
  return element.dataset["value"];
}

function updateInfoTable()
{
  let infotable = document.getElementById("info-table");
  let element_nums = [0,0,0,0,0,0];
  if (finder1 != "" && finder2 != "")
  {
    let finder1_quell_id = getElementIndexForId(finder1);
    let finder2_quell_id = getElementIndexForId(finder2);
    traverseCurrentRow((i) => 
      { 
        let quell_id = getElementIndexForId("q" + i);
        if (quell_id == finder1_quell_id || quell_id == finder2_quell_id)
        {
          element_nums[quell_id]++; 
        }
      });
    
    if (finder1_quell_id == finder2_quell_id && element_nums[finder1_quell_id] != 0)
    {
      element_nums[finder1_quell_id]++;
    }
  }
  else
  {
    for (let i = 0; i < 16; ++i)
    {
      element_nums[getElementIndexForId("q" + i)]++;
    }
  }
  for (let i = 0; i < 6; ++i)
  { 
    infotable.rows[i].cells[1].innerText = element_nums[i];
  }
}

function rerollField()
{
  for (let i = 0; i < 16; i++) 
    {
      rerollId("q" + i);
    }
  updateInfoTable()
}

function rerollFieldClicked()
{
  if (confirm("Willst Du das gesamte Feld wirklich neu würfeln?"))
  {
    rerollField();
  }
}


function rerollFinder()
{
  for (let i = 0; i < 4; i++) 
  {
    rerollId("f" + i);
  }
  let finder_button = document.getElementById("finder-button");
  finder_button.disabled = true;
}

function init()
{
  rerollField();
}

let finder1 = "";
let finder2 = "";

function quellen_allowDrop(ev) 
{
  if (ev.target && ev.target.id && ev.target.id.charAt(0) == 'd')
  {
    if (finder1 == "")
    {
      ev.preventDefault();
    }
    else if (finder2 == "")
    {
      tmp_finder2 = ev.target.id;
      if (Math.abs(Number(finder1.substring(1)) - Number(tmp_finder2.substring(1))) == 10  )
      {
        ev.preventDefault();
      }
    }
  }
}

function moveFinderToBorder(targetNode, sourceNode) 
{
  targetNode.src = sourceNode.src;
  targetNode.style.transform = "rotate(0)";
  sourceNode.src = "img/Empty.png";
  targetNode.dataset["value"] = sourceNode.dataset["value"];
}

function quellen_drop(ev) 
{
  if (ev.target && ev.target.id && ev.target.id.charAt(0) == 'd')
  {
    if (finder1 == "")
    {
      finder1 = ev.target.id;
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      finder = document.getElementById(data);
      moveFinderToBorder(ev.target, finder);
    }
    else 
    {
      finder2 = ev.target.id;
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      let finder = document.getElementById(data);
      moveFinderToBorder(ev.target, finder);
      let finder_button = document.getElementById("finder-button");
      finder_button.innerText = "Nimm die Quellen und würfle die Feld-Reihe neu.";
      finder_button.onclick = rerollRow;
      finder_button.disabled = false;
      updateInfoTable();
    }
  }
}

function resetBorderGfx(i)
{
  const rot_degrees = [0, 90, 90, 90, 90, 90, 0, 0, 0, 0, 180, 270, 270, 270, 270, 270, 180, 180, 180, 180];
  let element = document.getElementById("d" + i);
  element.style.transform = "rotate(" + rot_degrees[i] + "deg)";
  if (i % 5 == 0)
  {
    element.src = "img/RechtsUnten.png";
  }
  else
  {
    element.src = "img/Rechts.png";
  }
}

function traverseCurrentRow(traverse_fn)
{
  // d0  d1  d2  d3  d4 d5 
  // d6  q0  q1  q2  q3 d16
  // d7  q4  q5  q6  q5 d17
  // d8  q8  q9 q10 q11 d18
  // d9 q12 q13 q14 q15 d19
  // only d0-d9 are relevant 
  let start = Number(finder1.substring(1));
  let end = Number(finder2.substring(1));
  if (start > end)
  {
    start = end;
  }
  for (let i = 0; i < 4; ++i)
  {
    if (start == 0)
    {
      // top-left main diagonal
      traverse_fn(i * 5); 
    }
    else if (start == 5)
    {
      // top-right main diagonal
      traverse_fn((i + 1) * 3); 
    }
    else if (start <= 4)
    {
      // top-to-bottom
      traverse_fn(start + (i * 4) - 1); 
    }
    else 
    {
      // left-to-right
      traverse_fn(((start - 6) * 4) + i); 
    }
  }
}


function rerollRow()
{
  resetBorderGfx(Number(finder1.substring(1)));
  resetBorderGfx(Number(finder2.substring(1)));
  traverseCurrentRow((i) => { rerollId("q" + i); });
  finder1 = "";
  finder2 = "";
  updateInfoTable();
  for (let i = 0; i < 4; i++) 
  {
    let element = document.getElementById("f" + i);
    element.src = "img/Empty.png";
  }
  let finder_button = document.getElementById("finder-button");
  finder_button.innerText = "Finder würfeln";
  finder_button.onclick = rerollFinder;
}

function rerollFieldClicked()
{
  finder1 = "";
  finder2 = "";
  updateInfoTable();
  for (let i = 0; i < 4; i++) 
  {
    let element = document.getElementById("f" + i);
    element.src = "img/Empty.png";
  }
  let finder_button = document.getElementById("finder-button");
  finder_button.innerText = "Finder würfeln";
  finder_button.onclick = rerollFinder;
}

function startDrag(ev) 
{
  ev.dataTransfer.setData("text", ev.target.id);
}

function help()
{
  document.getElementById("help-overlay").style.display = "block"; 
}

function help_off()
{
  document.getElementById("help-overlay").style.display = "none"; 
}

function iframeclick() 
{
  document.getElementById("helpframe").contentWindow.document.body.onclick = help_off;
}
  