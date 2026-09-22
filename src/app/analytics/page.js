"use client";

import { useMemo } from "react";

import { useGarage } from "../../context/garageContext";
import StatisticCard from "../../components/StatisticCard";
import { fixingPrice } from "../../lib/format";

const Forecast = (props) => {
  const forecastGroups = useMemo(() => {
    const map = {};
    props.events.forEach((event) => {
      const key = event.title.trim().toLowerCase();
      if (!key) {
        return;
      }
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(event);
});
   


    return Object.entries(map)
      .filter(([, items]) => items.length >= 3)

      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
        const intervals = [];

          for (let i = 1; i < sorted.length; i += 1) {
            const first = new Date(sorted[i - 1].date);
            const second = new Date(sorted[i].date);
            const days = (second - first) / 86400000;
            intervals.push(days);
          }


        const avgInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
        const avgCost = sorted.reduce((sum, item) => sum + Number(item.cost || 0), 0) / sorted.length;
        const next = new Date(`${sorted[sorted.length - 1].date}T12:00:00`);

        next.setDate(next.getDate() + Math.round(avgInterval));


        return {
          key,
          title: sorted[sorted.length - 1].title,
          count: sorted.length,
          avgInterval,
          avgCost,
          next
        };

      });}, [props.events]);

  return (
    <section className="card">
      <div className="card-header">

        <div>
          <h2>Повторяющиеся работы</h2>
          <span>Статистический ориентир по истории автомобиля</span>
        </div>

      </div>

      {forecastGroups.length ? (
        <div className="forecast-list">
          {forecastGroups.map((item) => (
            <div className="forecast" key={item.key}>
            <div className="forecast-label">Следующее повторение</div>
            <h3>{item.title}</h3>
            <strong>
              {item.next.toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric"
              })}
            </strong>
            <div className="forecast-info">
            <span>{item.count} повторения</span>
            <span>≈ {Math.round(item.avgInterval)} дней</span>
            <span>≈ {fixingPrice(item.avgCost)}</span>
            </div>
            </div>
          ))}
        </div>

      ) : (
        //Недостаточно данных Добавте информацию 
      <div className="no-data large">
          Недостаточно данных для прогноза. Одна и та же работа должна встречаться минимум 3 раза.
        </div>)}

    </section>
  );};

export default function AnalyticsPage(){
  const GarageStorage = useGarage();
  
  const monthlyExpenses = useMemo(() => {
    const map = {};
    const records = [
      ...GarageStorage.events.map((event) => ({
        date: event.date,
        value: Number(event.cost || 0)
      })),

      ...GarageStorage.fuel.map((fuel) => ({
        date: fuel.date,
        value: Number(fuel.fuelValue || 0) * Number(fuel.pricePerLiter || 0)
      }))
    ];

    records.forEach(({ date, value }) => {
      const key = date?.slice(0, 7);

      if (key) {
        map[key] = (map[key] || 0) + value;
      }
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8);
    }, [GarageStorage.events, GarageStorage.fuel]);

  const maxAmount = Math.max(...monthlyExpenses.map(([, value]) => value), 1);
  const allExpenses = GarageStorage.service + GarageStorage.fuelCost;
  const servicePercent = allExpenses ? Math.round((GarageStorage.service / allExpenses) * 100) : 0;
  const fuelPercent = allExpenses ? 100 - servicePercent : 0;



  return (
    <div className="screen">
      <header className="screen-header">
        <div>

          <h1>Аналитика</h1>
          <p>Расходы, динамика и статистические ориентиры по автомобилю.</p>

        </div>
      </header>
      
      <section className="stats">

        <StatisticCard
          label="Стоимость владения"
          value={fixingPrice(GarageStorage.ownership)}
          hint="Покупка + все эксплуатационные расходы"
          accent
        />

        <StatisticCard
          label="Обслуживание и ремонт"
          value={fixingPrice(GarageStorage.service)}
          hint="История автомобиля"
        />

        <StatisticCard
          label="Топливо"
          value={fixingPrice(GarageStorage.fuelCost)}
          hint="Все заправки"
        />

        <StatisticCard
          label="Средние расходы / месяц"
          value={fixingPrice(GarageStorage.avgMonthly)}
          hint="Среднее по доступным месяцам"
        />
      </section>

      <div className="analytics-grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Расходы по месяцам</h2>
              <span>История всех расходов</span>
            </div>
          </div>



            <div className="chart">
              {monthlyExpenses.length ? (
                monthlyExpenses.map(([key, value]) => (
                  <div className="chart-bar-wrap" key={key}>
                    <div className="bar-value">{fixingPrice(value)}</div>
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max(8, (value / maxAmount) * 180)}px`
                      }}
                    />
                    <span>
                      {new Date(`${key}-01T12:00:00`).toLocaleDateString("ru-RU", {
                        month: "short"
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-data">Нет данных для графика</div>
              )}
            </div>
        </section>
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Структура расходов</h2>
              <span>За всё доступное время</span>
            </div>
          </div>
          <div className="chart-donut-wrap">
            <div
              className="chart-donut"
              style={{
                background: `conic-gradient(var(--blue) ${servicePercent}%, var(--soft-line) 0)`
              }}
            >
              <div>{allExpenses ? `${servicePercent}%` : "—"}</div>
            </div>
            <div className="chart-legend">
              <div>
                <span className="legend-mark service" />
                <div>
                  <strong>Обслуживание</strong>
                  <small>{fixingPrice(GarageStorage.service)} · {servicePercent}%</small>
                </div>
              </div>



              <div>
              <span className="legend-mark fuel" />
              <div>

              <strong>Топливо</strong>

              <small>{fixingPrice(GarageStorage.fuelCost)} · {fuelPercent}%</small>
              </div>
              </div>
            </div>
          </div>
      </section>
      </div>

      <Forecast events={GarageStorage.events} />
      
    </div>
  );
}
