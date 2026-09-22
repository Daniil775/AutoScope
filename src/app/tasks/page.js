"use client"; 

import { useState } from "react";
import { useGarage } from "../../context/garageContext";
import { TaskModal } from "../../components/Forms";
import StatisticCard from "../../components/StatisticCard";
import { formatDate as formatDateBase } from "../../lib/format";

const formatDate = (value) => (value ? formatDateBase(value) : "Дата не указана"); 


export default function TasksPage() {
  const GarageStorage = useGarage();
  const [modalState, setModalState] = useState({ open: false, task: null });

  const activeTasks = GarageStorage.tasks.filter((task) => !task.completed);
  const finishedTasks = GarageStorage.tasks.filter((task) => task.completed); 
 
  const save = (item) => { 
    const exists = GarageStorage.tasks.some((task) => task.id === item.id);

    if (exists) {
      GarageStorage.updateTask(item);
        return; 
      }

    GarageStorage.addTask(item);
  };

  const remove = (id) => {
    if (window.confirm("Удалить задачу?")) {
      GarageStorage.deleteTask(id); 
    } };

  const openModal = (task = null) => setModalState({ open: true, task });
  const closeModal = () => setModalState((current) => ({ ...current, open: false }));



  const renderTasks = (items, completed) =>{
    if (!items.length) { 
      return <div className="no-data">Нет задач</div>;  }

    return(
      <div className="tasks">
        {items.map((task) => (
          <article
            className={`task-item ${completed ? "completed" : ""}`}
            key={task.id}>


            <button
             className="btn-check"
              onClick={() => GarageStorage.toggleTask(task.id)}
              aria-label={completed ? "Вернуть задачу" : "Выполнить задачу"} >
              {completed ? "✓" : ""}

            </button>


            <div className ="task-body"> 
              <h3>{task.title} </h3>
              <div>

                <span>{formatDate(task.date)}</span>
                {task.odometer ? (
                  <span>{Number(task.odometer).toLocaleString("ru-RU")} км</span>
                ) : null}

              </div> </div>

            <div className= "actions">

              <button onClick={() => openModal(task)}>
                Изменить
              </button>
               
              <button className="text-danger" onClick={() => remove(task.id)}  >
                Удалить
              </button>

            </div> </article>
        )) }
      </div>

    );
  
  };




  return (
    <div className="screen">
      <header className="screen-header">

        <div>
          <h1>Задачи</h1> 
          <p>Напоминания о будущих работах и обслуживании.</p>
        </div>

        <button className="btn btn-primary" onClick={() => openModal()}>
          ＋ Добавить задачу
        </button></header>


      <section className="stats small">
         
        <StatisticCard label="Активные" value={activeTasks.length} hint="Нужно сделать" />
        <StatisticCard label="Выполненные" value={finishedTasks.length} hint="Уже закрыто" />
      </section>
                                                                     
      <div className="task-cols">
        <section className="card">
          <div className= "card-header">
            <div> 

              <h2>Активные</h2>
              <span>Запланированные работы</span>
            </div>
            
          </div>
          {renderTasks(activeTasks, false)}
        </section>



        <section className="card">
          <div className="card-header">
            <div>
              <h2>Выполненные</h2>
              <span>История задач</span>
            </div>
          </div>
          {renderTasks(finishedTasks, true)}
        </section>
      </div>



      <TaskModal
        open={modalState.open}
        task={modalState.task}
        onClose={closeModal}
        onSave={save}
      />

    </div>
  );
}



