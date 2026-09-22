"use client";


import Link from "next/link";
import { useState } from "react";
import { useGarage } from "../context/garageContext";
import { CarModal } from "../components/Forms";
import StatisticCard from "../components/StatisticCard";
import { fixingPrice, formatDate } from "../lib/format";

const emptyCarData = {
  brand: "",
  model: "",
  year: "",
  engine: "",
  odometer: "",
  purchasePrice: ""
};

function PanelHeading(props) {
  return (
    <div className="card-header">
      <div>
        <h2>{props.title}</h2>
        <span>{props.subtitle}</span>
      </div>
      <Link href={props.linkHref} className="link">{props.linkLabel}</Link>
    </div>
  );
}

export default function Dashboard() {
  const GarageStorage = useGarage();
  const [open, setOpen] = useState(false);
  const latestEvents = [...GarageStorage.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const activeTasks = GarageStorage.tasks.filter((x) => !x.completed).slice(0, 3);

  if (!GarageStorage.userCar) {
    return (
      <div className="screen">
        <header className="screen-header">
          <div>

            <h1>Обзор</h1>
            <p>Вся история эксплуатации вашего автомобиля — в одном месте.</p>
          </div>

        </header>

        <section className="empty-car">
          <div className="empty-car-icon">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`} alt="" />
          </div>
          <div>

            <h2>Добавьте свой автомобиль</h2>
            <p>
              Заполните профиль автомобиля, чтобы начать вести историю обслуживания,
              расходов, топлива и задач.
            </p>

            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              ＋ Добавить автомобиль
            </button>
          </div>
        </section>

        <section className="stats">
          <StatisticCard label="Стоимость владения" value="—" hint="Добавьте автомобиль" accent />
          <StatisticCard label="Эксплуатационные расходы" value="0 ₽" hint="Пока нет записей" />
          <StatisticCard label="Расход за текущий месяц" value="0 ₽" hint="Пока нет записей" />
          <StatisticCard label="Средний расход" value="—" hint="Недостаточно данных" />
        </section>

        <div className="dashboard">
          <section className="card">
            <PanelHeading
              title="История автомобиля"
              subtitle="Здесь появятся ваши записи"
              linkHref="/history"
              linkLabel="Открыть историю →"
            />
            <div className="no-data">После добавления автомобиля можно записывать обслуживание и ремонт.</div>
          </section>

            <section className="card">
              <PanelHeading
                title="Задачи"
                subtitle="Будущие работы"
                linkHref="/tasks"
                linkLabel="Все задачи →"
              />
              <div className="no-data">Пока нет задач.</div>
            </section>
        </div>


        <CarModal open={open} userCar={emptyCarData} onClose={() => setOpen(false)} onSave={GarageStorage.updateCar} />
      </div>
    );
  }


  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <h1>Обзор</h1>
          <p>Вся история эксплуатации вашего автомобиля — в одном месте.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          ⚙ Настроить автомобиль
        </button>
      </header>



      <section className="car-hero">
        <div className="car-main">
          <span className="text-muted">Текущий автомобиль</span>
          <h2>{GarageStorage.userCar.brand} {GarageStorage.userCar.model}</h2>
          <div className="car-specs">
            <span>{GarageStorage.userCar.year}</span>
            <span>{GarageStorage.userCar.engine}</span>
          </div>
        </div>
        <div className="odometer">
          <span>Пробег</span>
          <strong>{Number(GarageStorage.userCar.odometer || 0).toLocaleString("ru-RU")} км</strong>
        </div>
      </section>

      <div className="section-title">
        <div>
          <h2>Основные показатели</h2>
          <span>Автоматически рассчитано по вашим данным</span>
        </div>
      </div>

      <section className="stats">
        <StatisticCard
          label="Стоимость владения"
          value={fixingPrice(GarageStorage.ownership)}
          hint={`Покупка ${fixingPrice(GarageStorage.userCar.purchasePrice)} + расходы`}
          accent
        />
        <StatisticCard
          label="Эксплуатационные расходы"
          value={fixingPrice(GarageStorage.operational)}
          hint="Обслуживание + топливо"
        />
        <StatisticCard
          label="Расход за текущий месяц"
          value={fixingPrice(GarageStorage.monthSpend)}
          hint="Все записи и заправки"
        />
        <StatisticCard
          label="Средний расход"
          value={GarageStorage.avgConsumption ? `${GarageStorage.avgConsumption.toFixed(1)} л / 100 км` : "Недостаточно данных"}
          hint="По данным заправок"
        />
      </section>

      <div className="dashboard">
        <section className="card">
          <PanelHeading
            title="Последняя история"
            subtitle="Новые записи автомобиля"
            linkHref="/history"
            linkLabel="Вся история →"
          />

          {latestEvents.length ? latestEvents.map((record, rowIndex) => (
            <div className="row" key={record.id}>
              <div className="row-icon">{rowIndex + 1}</div>
              <div className="row-content">
                <strong>{record.title}</strong>
                <span>{formatDate(record.date)} · {Number(record.odometer).toLocaleString("ru-RU")} км</span>
              </div>
              <strong>{fixingPrice(record.cost)}</strong>
            </div>
          )) : <div className="no-data">Записей пока нет.</div>}
        </section>

        <section className="card">
          <PanelHeading
            title="Ближайшие задачи"
            subtitle="Что не забыть сделать"
            linkHref="/tasks"
            linkLabel="Все задачи →"
          />

          {activeTasks.length ? activeTasks.map((task, index) => (
            <div className="task" key={task.id}>
              <div className="task-number">{index + 1}</div>
              <div>

                <strong>{task.title}</strong>
                <span>

                  {task.date ? formatDate(task.date) : "Дата не указана"}
                  {task.odometer ? ` · ${Number(task.odometer).toLocaleString("ru-RU")} км` : ""}
                </span>
              </div>
            </div>
          )) : <div className="no-data">Активных задач нет.</div>}
        </section>
      </div>

      <CarModal open={open} userCar={GarageStorage.userCar} onClose={() => setOpen(false)} onSave={GarageStorage.updateCar} />

    </div>
  );
}
