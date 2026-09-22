"use client";

import { useMemo, useState } from "react";
import { useGarage } from "../../context/garageContext";
import { AttachmentViewer, EventModal } from "../../components/Forms";
import StatisticCard from "../../components/StatisticCard";
import { fixingPrice, formatDate } from "../../lib/format";


export default function HistoryPage() {
  const GarageStorage = useGarage();
  const [searchText, setSearchText] = useState("");
  const [modalState, setModalState] = useState({ open: false, item: null });

  const events = useMemo(() => {
    const search = searchText.trim().toLowerCase();


    return [...GarageStorage.events]
      .filter((event) => {
        return `${event.title} ${event.description}`
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => b.date.localeCompare(a.date));

  }, [GarageStorage.events, searchText]);



  const average = GarageStorage.events.length ? GarageStorage.service / GarageStorage.events.length : 0;

  const save = (item) => {
    const exists = GarageStorage.events.some((event) => event.id === item.id);

    if (exists) {
      GarageStorage.updateEvent(item);
      return;
    }


    GarageStorage.addEvent(item);
  };

  const remove = (id) => {
    if (window.confirm("Удалить эту запись?")) {
      GarageStorage.deleteEvent(id);
    }
  };

  const openModal = (item = null) => setModalState({ open: true, item });
  const closeModal = () => setModalState((current) => ({ ...current, open: false }));

  return (
    <div className="screen">


      <header className="screen-header">
        <div>
          <h1>История</h1>
          <p>Обслуживание, ремонт, детали и другие расходы.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          ＋ Добавить запись
        </button>
      </header>


      <section className="stats small">
        <StatisticCard
          label="Записей"
          value={GarageStorage.events.length}
          hint="За всё время"
        />

        <StatisticCard
          label="На обслуживание"
          value={fixingPrice(GarageStorage.service)}
          hint="Все записи журнала"

        />

        <StatisticCard
          label="Средняя запись"
          value={fixingPrice(average)}
          hint="Средняя стоимость"
        />
      </section>

      <section className="card">
        <div className="top-bar">
          <div className="search">
            <span>⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Поиск в истории..."
            />
          </div>

          <span className="count">{events.length} записей</span>
        </div>

        <div className="history">
          {events.map((item, index) => (
            <article className="history-item" key={item.id}>
              <div className="history-item-icon">{index + 1}</div>

              <div className="history-item-info">

                <h3>{item.title}</h3>
                <p>{item.description || "Без описания"}</p>

                <div className="info">
                  <span>{formatDate(item.date)}</span>
                  <span>{Number(item.odometer).toLocaleString("ru-RU")} км</span>

                  {item.attachments?.length > 0 && (
                    <div className="history-item-files">
                      {item.attachments.map((file, fileIndex) => (
                        <AttachmentViewer
                          key={`${file.name}-${fileIndex}`}
                          file={file}
                        />
                      ))}

                    </div>)}
              </div>
              </div>

              <div className="history-cost">{fixingPrice(item.cost)}</div>

              <div className="actions">
                <button onClick={() => openModal(item)}> Изменить </button>
                <button className="text-danger" onClick={() => remove(item.id)}> Удалить </button>
              </div>
            </article>
          ))}

          {!events.length && (<div className="no-data large">По вашему запросу ничего не найдено.</div>)}
        </div>
      </section>

      <EventModal
        open={modalState.open}
        event={modalState.item}
        onClose={closeModal}
        onSave={save}
      />
    </div>
  );}
