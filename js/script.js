function diceroll()
{
  return Math.floor(Math.random() * 6);
}

function rerollId(element)
{
  const element_names = ["Fire", "Water", "Air", "Earth", "Wisdom", "Power"];
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
  let element_nums = [0,0,0,0,0,0];
  if (fieldFinderIndex.hasValidRow())
  {
    let finder1_quell_id = fieldFinderIndex.get1stFinder().dataset["value"];
    let finder2_quell_id = fieldFinderIndex.get2ndFinder().dataset["value"]; 
    fieldFinderIndex.traverseCurrentRow((i) => 
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
    let infotext = document.getElementById("info-text-" + i);
    infotext.innerText = element_nums[i];
  }
}

function rerollField()
{
  for (let i = 0; i < 16; i++) 
  {
    rerollId(document.getElementById("q" + i));
  }
  updateInfoTable()
}

function removeAllFinders()
{
  fieldFinderIndex.clear();
  for (let i = 0; i < 4; i++) 
  {
    let element = document.getElementById("f" + i);
    if (element)
    {
      interact(element).unset();
      element.remove();
    }
  }
  updateFinderButtonState();
}

function rerollFieldClicked()
{
  removeAllFinders();
  rerollField();
}

function setRelativeFinderPosition(finder, x, y)
{
  finder.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
        
  // update the posiion attributes
  finder.setAttribute('data-x', x)
  finder.setAttribute('data-y', y)
}


class FieldFinder {
  constructor() {
    this.field_finder = new Map;
    this.finder_field = new Map;
  }
  
  clear()
  {
    this.field_finder.clear();
    this.finder_field.clear();
  }

  hasFinder(finder) 
  {
    return this.finder_field.has(finder);
  }

  getFieldFromFinder(finder)
  {
    return this.finder_field.get(finder);
  }

  hasField(field) 
  {
    return this.field_finder.has(field);
  }

  removeFinder(finder)
  {
    if (this.finder_field.has(finder))
    {
      let field = this.finder_field.get(finder);
      this.finder_field.delete(finder);
      this.field_finder.delete(field);
    }
  }

  getFinderFromField(field)
  {
    return this.field_finder.get(field);
  }

  setFieldFinder(field, finder)
  {
    this.field_finder.set(field, finder); 
    this.finder_field.set(finder, field);
  }

  getOnlyFieldId()
  {
    if (this.field_finder.size == 1)
    {
      return this.field_finder.keys().next().value.id;
    }
    else
    {
      return "";
    }
  }

  hasValidRow()
  {
    if (this.field_finder.size == 2)
    {
      let fields = this.field_finder.keys();
      let start = Number(fields.next().value.id.substring(1));
      let end = Number(fields.next().value.id.substring(1));
      return Math.abs(start - end) == 10;
    }
    return false;
  }

  get1stFinder()
  {
    return this.finder_field.keys().next().value;
  }  

  get2ndFinder()
  {
    let i = this.finder_field.keys();
    i.next();
    return i.next().value;
  }  

  traverseCurrentRow(traverse_fn)
  {
    // d0  d1  d2  d3  d4 d5 
    // d6  q0  q1  q2  q3 d16
    // d7  q4  q5  q6  q5 d17
    // d8  q8  q9 q10 q11 d18
    // d9 q12 q13 q14 q15 d19
    // only d0-d9 are relevant 
    if (this.field_finder.size != 2)
    {
      throw "traverseCurrentRow with size != 2 called";
    }
  
    let fields = this.field_finder.keys();
    let start = Number(fields.next().value.id.substring(1));
    let end = Number(fields.next().value.id.substring(1));
    if (Math.abs(start - end) != 10)
    {
      throw "traverseCurrentRow with non-mathcing fields called";
    }

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
};

let fieldFinderIndex = new FieldFinder;


function dropCompletesRow(field)
{
  let field1Id = fieldFinderIndex.getOnlyFieldId()
  if (field1Id != "")
  {
    let field2Id = field.id;
    if (Math.abs(Number(field1Id.substring(1)) - Number(field2Id.substring(1))) == 10)
    {
      return true;
    }
  }
  return false;  
}


interact('.dropzone').dropzone({
  // Require a 60% element overlap for a drop to be possible
  overlap: 0.60,

  // listen for drop related events:
  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active')
  },

  ondragenter: function (event) {
    var dropzoneElement = event.target

    // feedback the possibility of a drop
    if (dropCompletesRow(dropzoneElement))
    {
      dropzoneElement.classList.add('drop-target-valid')
    }
    else
    {
      dropzoneElement.classList.add('drop-target')
    }
  },

  ondragleave: function (event) {
    // remove the drop feedback style
    event.target.classList.remove('drop-target')
    event.target.classList.remove('drop-target-valid')
  },

  ondrop: function (event) {
    quellen_drop(event.target, event.relatedTarget);
  },

  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active')
    event.target.classList.remove('drop-target')
    event.target.classList.remove('drop-target-valid')
    if (!fieldFinderIndex.hasFinder(event.relatedTarget))
    {
      setRelativeFinderPosition(event.relatedTarget, 0, 0);
    }
    updateInfoTable();
    updateFinderButtonState();
  }
})  

function smartClick(event)
{
  let finder = event.target;
  if (fieldFinderIndex.hasFinder(finder))
  {
    fieldFinderIndex.removeFinder(finder);
    setRelativeFinderPosition(finder, 0, 0);
    updateInfoTable();
    updateFinderButtonState();
  }
  else 
  { 
    let field1Id = fieldFinderIndex.getOnlyFieldId();
    if (field1Id != "")
    {
      let field1Index = Number(field1Id.substring(1));
      let field2Index = field1Index >= 10 ? field1Index - 10 : field1Index + 10;
      let target = document.getElementById('d' + field2Index);
      fieldFinderIndex.setFieldFinder(target, finder);
      moveFinderToBorder(target, finder);
      updateInfoTable();
      updateFinderButtonState();
    }
  }
}

function rerollFinder()
{
  for (let i = 0; i < 4; i++) 
  {
    var img = document.createElement("img");
    img.classList.add("finder");
    img.id = "f" + i;
    rerollId(img);
    let finder_src = document.getElementById("pf" + i);
    finder_src.appendChild(img);

    interact(img).draggable({
      listeners: {
        start (event) 
        {
          fieldFinderIndex.removeFinder(event.target);
        },
        move (event) 
        {
          var target = event.target
          // keep the dragged position in the data-x/data-y attributes
          var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
          var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
        
          // translate the element
          target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
        
          // update the posiion attributes
          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
        },
      }
    }).on('tap', function (event) { smartClick(event); });
  }
  updateFinderButtonState();
}

function init()
{
  rerollField();
}

function moveFinderToBorder(targetNode, finder) 
{
  let x = targetNode.x - finder.x;
  let y = targetNode.y - finder.y;
  setRelativeFinderPosition(finder, x, y);
}

function repositionFinder()
{
  for (let i = 0; i < 4; i++) 
  {
    let finder = document.getElementById("f" + i);
    if (finder)
    {
      if (!fieldFinderIndex.hasFinder(finder))
      {
        setRelativeFinderPosition(finder, 0, 0);
      }
      else
      {
        moveFinderToBorder(fieldFinderIndex.getFieldFromFinder(finder), finder);
      }
    }
  }
}

function quellen_drop(target, finder) 
{
  if (fieldFinderIndex.hasField(target))
  {
    let oldFinder = fieldFinderIndex.getFinderFromField(target);
    setRelativeFinderPosition(oldFinder, 0, 0);
    fieldFinderIndex.removeFinder(oldFinder)
  }
  fieldFinderIndex.setFieldFinder(target, finder);
  moveFinderToBorder(target, finder);
}

function updateFinderButtonState()
{
  let finder_button = document.getElementById("finder-button");
  let finder = document.getElementById("f0");
  if (!finder)
  {
    finder_button.innerText = "Finder würfeln";
    finder_button.onclick = rerollFinder;
    finder_button.disabled = false;
  }
  else if (fieldFinderIndex.hasValidRow())
  {
    finder_button.innerText = "Nimm die Quellen und würfle die Feld-Reihe neu.";
    finder_button.onclick = rerollRow;
    finder_button.disabled = false;
  }
  else
  {
    finder_button.disabled = true;
  }
}

function rerollRow()
{
  fieldFinderIndex.traverseCurrentRow((i) => { rerollId(document.getElementById("q" + i)); });
  removeAllFinders();
  updateInfoTable();
  updateFinderButtonState();
}

function help()
{
  document.getElementById("help-overlay").style.display = "flex"; 
}

function help_off()
{
  document.getElementById("help-overlay").style.display = "none"; 
}

function iframeclick() 
{
  document.getElementById("helpframe").contentWindow.document.body.onclick = help_off;
}

timeout = false, // holder for timeout id
delay = 250, // delay after event is "complete" to run callback

// window.resize event listener
window.addEventListener('resize', function() {
  // clear the timeout
  clearTimeout(timeout);
  // start timing for event "completion"
  timeout = setTimeout(repositionFinder, delay);
});

screen.orientation.addEventListener('change', function(event) {
  repositionFinder();
});