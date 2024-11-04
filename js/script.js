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

function init()
{

  for (let i = 0; i < 16; i++) 
  {
    rerollId("q" + i);
  }

  for (let i = 0; i < 4; i++) 
  {
    rerollId("f" + i);
  }
}


function quellen_allowDrop(ev) 
{
  if (ev.target && ev.target.id && ev.target.id.charAt(0) == 'd')
  {
    finder1_id = ev.target.parentNode.parentNode.dataset["finder1"];
    if (finder1_id == "")
    {
      ev.preventDefault();
    }
    else if (ev.target.parentNode.parentNode.dataset["finder2"] == "")
    {
      finder2_id = ev.target.id;
      if (Math.abs(Number(finder1_id.substr(1)) - Number(finder2_id.substr(1))) == 10  )
      {
        ev.preventDefault();
      }
    }
  }
}

function setFinderToBorder(targetNode, sourceNode) 
{
  targetNode.src = sourceNode.src;
  targetNode.style.transform = "rotate(0)";
}

function quellen_drop(ev) 
{
  if (ev.target && ev.target.id && ev.target.id.charAt(0) == 'd')
  {
    grid = ev.target.parentNode.parentNode;
    if (grid.dataset["finder1"] == "")
    {
      grid.dataset["finder1"] = ev.target.id;
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      finder = document.getElementById(data);
      setFinderToBorder(ev.target, finder);
    }
  }
}


function startDrag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

