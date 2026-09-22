"use client";

import { fixingPrice, formatDate } from "../../lib/format";
import { useState } from "react"; 
import { useGarage } from "../../context/garageContext";
import { FuelModal } from "../../components/Forms"; 
import StatisticCard from "../../components/StatisticCard"; 


 const FuelPage = () => { 
  const GarageStorage = useGarage();
  const [modalState, setModalState] = useState({ open: false, editing: null });

  const sortedFuel = [...GarageStorage.fuel].sort( (a, b) => b.date.localeCompare(a.date) );
  const openModal = (item = null) => setModalState( { open: true, editing: item } );
  const closeModal = () => setModalState( (current) => ( { ...current, open: false } ) );

  const save = (item) => {
    const exists = GarageStorage.fuel.some((fuel) => fuel.id === item.id);
    exists ? GarageStorage.updateFuel(item) : GarageStorage.addFuel(item);
  };

  const remove = (id) => {
    if (window.confirm("Удалить эту заправку?")) {
      GarageStorage.deleteFuel(id);
    }
  };

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
           <h1>Топливо</h1> 
          <p>Заправки, цены, литры и ориентировочный расход.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          ＋ Добавить заправку
        </button>
      </header>

      <section className="stats small cols-5">
        <StatisticCard label="Потрачено" value={fixingPrice(GarageStorage.fuelCost)} />

        <StatisticCard 
        label="Залито" 
        value={`${GarageStorage.totalLiters.toFixed(0)} л`} 
        />

        <StatisticCard
          label="Средняя цена"
          value={GarageStorage.avgFuelPrice ? `${GarageStorage.avgFuelPrice.toFixed(2)} ₽ / л` : "—"}
        />

        <StatisticCard
          label="Средний расход"
          value={GarageStorage.avgConsumption ? `${GarageStorage.avgConsumption.toFixed(1)} л / 100 км` : "Недостаточно данных"}
        />

        <StatisticCard label="Заправок" value={GarageStorage.fuel.length} />

      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <h2>Журнал заправок</h2>
            <span>От новых к старым</span>
          </div>
        </div>
            <div className="fuel-table">
              <div className="fuel-head">

                <span>Дата</span>
                <span>Пробег</span>
                <span>Литры</span>
                <span>Цена / л</span>
                <span>Сумма</span>
                <span />


              </div>
          {sortedFuel.map((item) => (
            <div className="fuel-row" key={item.id}>

              <span>{formatDate(item.date)}</span>
              <span>{Number(item.odometer).toLocaleString("ru-RU")} км</span>
              <span>{Number(item.fuelValue).toFixed(1)} л</span>
              <span>{Number(item.pricePerLiter).toFixed(2)} ₽</span>
              <strong>{fixingPrice(item.fuelValue * item.pricePerLiter)}</strong>

              <span className="actions">
                <button onClick={() => openModal(item)}> Изменить</button>
                <button className="text-danger" onClick={() => remove(item.id)}> Удалить </button>
              </span>
            </div>
          ))}
        </div>


        {!sortedFuel.length && <div className="no-data large">Заправок пока нет.</div> } 
      </section>


          <FuelModal
            open={modalState.open}
            fuel={modalState.editing}
            onClose={closeModal}
            onSave={save}
           />


    </div>
  );
};

export default FuelPage; 






