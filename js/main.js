const start = document.querySelector('.start'),
      wrap = document.querySelector('.wrap'),
      container = document.querySelector('.container'),
      modal = document.querySelector('.modal'),
      modalClose = document.querySelector('.modal-close'),
      form = document.querySelector('.modal-form'),
      textInput = document.querySelector('.textInput');

let state = {
  tasks: [],
  currentDay: {},
  days: {},
  currentId: 0,
};
let localStore = localStorage.getItem('stateForMyProject');
if(localStore){
  oldState = JSON.parse(localStore);
  showTasks(state = oldState);
}
document.addEventListener("DOMContentLoaded", () => {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=57&lon=24.08&exclude=hourly&units=metric&appid=7bcea5d91605a157136e6a60a2106469`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    state.days = data.daily;
    console.log(state);
  })
  .catch((error) => console.log(error));
});

let myCalendar = new VanillaCalendar({
  selector: "#myCalendar",
  date: new Date(),
  todaysDate: new Date(),
  onSelect: (data, elem) => {
    let currentDate = new Date().toLocaleDateString('ru');
    let selectedDate = new Date(data.date).toLocaleDateString('ru')
    let num = selectedDate.split('.')[0] - currentDate.split('.')[0];
    state.currentDay = {date: selectedDate, num: num};
  }
})


function createMiniTask(task) {
  let miniTask = document.createElement('div');
  miniTask.setAttribute(`id`, task.id);
  miniTask.draggable="true";
  let nVar = 'var' + task.title.split('.').join('');
  window[nVar] = document.getElementsByClassName(`cl${task.title.split('.').join('')}`)[0];
  container.append(window[nVar]);
  window[nVar].append(miniTask);

  let tempr = window[nVar].getElementsByClassName('temp')[0];
  let date = window[nVar].getElementsByClassName('date')[0];

  tempr.textContent = ` t. ${task.dayTempr} C`;
  date.textContent = ` date ${task.title}`;

  miniTask.className = 'mini-task';
  if(task.done){
    miniTask.classList.add('check');
  } else {
    miniTask.classList.remove('check');
  }
  miniTask.innerHTML = `
    <div class='mini-header'>
      <span class='span-temp'>${task.dayTempr}</span>
      <span class='mini-task-title'>${task.title}</span>
    </div>
    <button class='btn done'>done</button>
    <button class='btn remove'>rem</button>
    <div class='text-mini'>${task.text}</div>
    <button class='btn edit'>edit</button>
  `
  miniTask.addEventListener('click', clickOnMiniTask);
  dragAndDrop();
}

function clickOnMiniTask(e){
  let buttons = this.querySelectorAll('.btn'),
      btnDone = this.querySelector('.done'),
      btnRem = this.querySelector('.remove'),
      btnEdit = this.querySelector('.edit');
// Click on Done
  if(e.target == btnDone){
    if(this.classList.contains('check')) {
      state.tasks.forEach((task) => {
        if(task.id == this.id) {
         task.done = false;
      }});
    showTasks(state)
    } else {
      state.tasks.forEach((task) => {
        if(task.id == this.id) {
         task.done = true;
      }});
      showTasks(state)
    }
  }
// Click on rem
  if(e.target == btnRem){
    let newTasks = state.tasks.filter((task) => task.id != this.id);
    state.tasks = newTasks;
    showTasks(state);
  }
// Click on Edit
  if(e.target == btnEdit){
    state.tasks.forEach((task) => {
      if(task.id == this.id) {
        textInput.value = task.text;
        modal.setAttribute(`id`, task.id);
        modal.style.display = 'block';
      }
    });
  }


// Click on task
  if (this.className == 'mini-task' || this.className == 'mini-task check') {
    document.querySelectorAll('.mini-task').forEach((task) => task.classList.remove('open'));
    document.querySelectorAll('.btn').forEach((btn) => btn.classList.remove('btn-open'))
    buttons.forEach((btn) => btn.classList.add('btn-open'))
    this.classList.add('open');
  } else {
    buttons.forEach((btn) => btn.classList.remove('btn-open'));
    this.classList.remove('open');
  }
}


function showTasks(state) {
  // TUT
  container.innerHTML = '';
  for(let task of state.tasks){
    let newVar = 'var' + task.title.split('.').join('');
    if(document.getElementsByClassName('cl' + task.title.split('.').join('')).length == 0) {
      window[newVar] = document.createElement('div');
      window[newVar].className = `cl${task.title.split('.').join('')} mini-container`;
      let blockTitle = document.createElement("div");
      blockTitle.innerHTML = `<p class='temp'></p><p class ='date'></p>`
      window[newVar].prepend(blockTitle);
      container.append(window[newVar]);
    }
  }

  let jsonState = JSON.stringify(state);
  localStorage.setItem('stateForMyProject', jsonState);
  state.tasks.forEach(element => createMiniTask(element));


}

start.addEventListener('click', () => {
  modal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
  modal.id = 'null';
  textInput.value = '';
})

function makeNewState(divId){
  //EDIT

  if(divId != 'null'){

    let editedTasks = state.tasks.map((task) => {
      if(Number(divId) == task.id){
        task.title = state.currentDay.date;
        task.dayTempr = state.days[state.currentDay.num] ? state.days[state.currentDay.num].temp.day : 'no data';
        task.text = textInput.value;
        return task
      }
      return task
    })
      let sortedTasks = editedTasks.sort((a, b) => {
      if(a.title.split('.').join('') < b.title.split('.').join('')){
        return -1;
      }
      if(a.title.split('.').join('') > b.title.split('.').join('')){
        return 1;
      }
      return 0;
    })
    state.tasks = sortedTasks;

  //NEW
  } else {

    state.tasks.push({
      id: state.currentId,
      title: state.currentDay.date,
      text: textInput.value,
      done: false,
      dayNr: state.currentDay.num,
      dayTempr: state.days[state.currentDay.num] ? state.days[state.currentDay.num].temp.day : 'no data'
    });
    state.tasks.sort((a, b) => {
      if(a.title.split('.').join('') < b.title.split('.').join('')){
        return -1;
      }
      if(a.title.split('.').join('') > b.title.split('.').join('')){
        return 1;
      }
      return 0;
    })
    state.currentId += 1;
  };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  makeNewState(e.target.parentNode.id)
//  console.log(state.day)
  modal.style.display = 'none';
  textInput.value = '';
  e.target.parentNode.id = null;
  showTasks(state)
});

function dragAndDrop() {

  let dragVar;
  let dragDate;
  let dragTemp;
  let dragText;
  const dragOver = function (evt) {
      evt.preventDefault();
      this.classList.add('hovered');
  };
  const dragStart = function () {
    dragVar = this.id;
    dragText = this.querySelector('.text-mini').textContent;
  };

  const dragEnter = function (evt) {
      evt.preventDefault();
      this.classList.add('hovered');
  };
  const dragLeave = function () {
    this.classList.remove('hovered');
  };
  const dragDrop = function () {
    dragDate = this.querySelector('.mini-task-title').textContent;
    dragTemp = this.querySelector('.span-temp').textContent;

    let editedTasks = state.tasks.map((task) => {
      if(dragVar == task.id){
        task.title = dragDate;
        task.dayTempr = dragTemp;
        task.text = dragText;
        return task
      }
      return task
    })
      let sortedTasks = editedTasks.sort((a, b) => {
      if(a.title.split('.').join('') < b.title.split('.').join('')){
        return -1;
      }
      if(a.title.split('.').join('') > b.title.split('.').join('')){
        return 1;
      }
      return 0;
    })
    state.tasks = sortedTasks;

    showTasks(state);
    this.classList.remove('hovered');
  };
  let containers = document.querySelectorAll('.mini-container');
  containers.forEach(container => {
    container.addEventListener('dragover', dragOver);
    container.addEventListener('dragenter', dragEnter);
    container.addEventListener('dragleave', dragLeave);
    container.addEventListener('drop', dragDrop);
  })

  let allTasks = document.querySelectorAll('.mini-task');
    allTasks.forEach(task => {
    task.addEventListener('dragstart', dragStart);
  })
}
