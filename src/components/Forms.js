"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";

const today = () => new Date().toISOString().slice(0, 10);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function inputField({ label, children, className = "" }) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      {children}

    </label>
  );
}
const Footer = (props) => {
  const submitText = props.submitText || "Сохранить";

  return (
    <div className="form-actions">
      <button type="button" className="btn btn-secondary" onClick={props.onClose}>
        Отмена
      </button>
      <button className="btn btn-primary">{submitText}</button>
    </div>
  );
};

const emptyCar = {
  brand: "",
  model: "",
  year: "",
  engine: "",
  odometer: "",
  purchasePrice: ""
};

export function CarModal(props) {
  const { onClose, onSave } = props;
  const [carFields, setCarFields] = useState(props.userCar || emptyCar);

  useEffect(() => {
    if (props.open) {
      setCarFields(props.userCar || emptyCar);
    }
  }, [props.open, props.userCar]);

  const updateField = (key, value) => {
    setCarFields((previous) => ({ ...previous, [key]: value }));
  };

  const save = (event) => {
    event.preventDefault();

    onSave({
      ...carFields,
      year: Number(carFields.year),
      odometer: Number(carFields.odometer),
      purchasePrice: Number(carFields.purchasePrice)
    });

    onClose();
  };

  return (
    <Modal open={props.open} onClose={onClose} title="Автомобиль">
      <form onSubmit={save}>
        <div className="form-row cols-2">
          <InputField label="Марка">
          <input
            value={carFields.brand}
            onChange={(event) => updateField("brand", event.target.value)}
            required
          />
          </InputField>

          <InputField label="Модель">
            <input
              value={carFields.model}
              onChange={(event) => updateField("model", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Год выпуска">
            <input
              type="number"
              value={carFields.year}
              onChange={(event) => updateField("year", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Двигатель">
            <input
              value={carFields.engine}
              onChange={(event) => updateField("engine", event.target.value)}
              placeholder="Например, 2.0 бензин"
              required
            />
          </InputField>

          <InputField label="Текущий пробег">
            <input
              type="number"
              min="0"
              value={carFields.odometer}
              onChange={(event) => updateField("odometer", event.target.value)}
              required
            />
          </InputField>

            <InputField label="Цена покупки, ₽">
              <input
                type="number"
                min="0"
                value={carFields.purchasePrice}
                onChange={(event) => updateField("purchasePrice", event.target.value)}
                required
              />
            </InputField>
          </div>

        <Footer onClose={onClose} />
      </form>
    </Modal>
);}

export const AttachmentViewer = (props) => {
  const [open, setOpen] = useState(false);
  const isImage = props.file.type?.startsWith("image/");
  const isPdf = props.file.type === "application/pdf";
  const file = props.file;

  return (
    <>
      <button
        type="button"
        className="file-card"
        onClick={() => setOpen(true)}
      >
        {isImage ? (
          <img src={file.dataUrl} alt={file.name} />
        ) : (
          <span className="file-preview">{isPdf ? "PDF" : "FILE"}</span>
        )}
        <span>{file.name}</span>
      </button>

      {open && (
        <div className="file-viewer" onMouseDown={() => setOpen(false)}>
          <div
            className="file-viewer-body"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="file-viewer-head">
              <strong>{file.name}</strong>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            {isImage && (
              <img
                className="file-full"
                src={file.dataUrl}
                alt={file.name}
              />
            )}

            {isPdf && (
              <iframe
                className="file-doc"
                src={file.dataUrl}
                title={file.name}
              />
            )}

            {!isImage && !isPdf && (
              <div className="file-download">
                <p>Предпросмотр этого типа файла недоступен в браузере.</p>
                <a href={file.dataUrl} download={file.name} className="btn btn-primary">
                  Скачать файл
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const emptyEvent = {
  title: "",
  date: today(),
  odometer: "",
  cost: "",
  description: "",
  attachments: []
};

export function EventModal({ open, event, onClose, onSave }) {
  const [eventFields, setEventFields] = useState(event || emptyEvent);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (open) {
      setEventFields(event || emptyEvent);
    }
  }, [open, event]);

  const updateField = (key, value) => {
    setEventFields((previous) => ({ ...previous, [key]: value }));
  };

  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFiles = async (list) => {
    setLoadingFiles(true);

    try {
      const eligible = Array.from(list).filter((file) => file.size <= 2.5 * 1024 * 1024);
      const loaded = await Promise.all(eligible.map(readAsDataUrl));

      setEventFields((previous) => ({
        ...previous,
        attachments: [...(previous.attachments || []), ...loaded]
      }));
    } catch (error) {
      console.error("Не удалось прочитать файл", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const save = (event) => {
    event.preventDefault();

    onSave({
      ...eventFields,
      id: eventFields.id || makeId("event"),
      odometer: Number(eventFields.odometer),
      cost: Number(eventFields.cost)
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? "Изменить запись" : "Новая запись"}
      wide
    >
      <form onSubmit={save}>
        <div className="form-row cols-2">
          <InputField label="Название">
            <input
              value={eventFields.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Например, Замена масла"
              required
            />
          </InputField>

          <InputField label="Дата">
            <input
              type="date"
              value={eventFields.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Пробег, км">
            <input
              type="number"
              min="0"
              value={eventFields.odometer}
              onChange={(event) => updateField("odometer", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Стоимость, ₽">
            <input
              type="number"
              min="0"
              step="0.01"
              value={eventFields.cost}
              onChange={(event) => updateField("cost", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Описание" className="full-width">
            <textarea
              rows="4"
              value={eventFields.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Что было сделано?"
            />
          </InputField>

          

          <InputField label="Фото и документы" className="full-width">
            <label className="file-input">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(event) => handleFiles(event.target.files)}
              />

              <span>Выбрать файлы</span>
              <small>до 2.5 МБ каждый</small>
            </label>


            {loadingFiles && <small>Читаем файлы…</small>}

            {eventFields.attachments?.length > 0 && (
              <div className="file-list">
                {eventFields.attachments.map((file, index) => (
                  <AttachmentViewer
                    key={`${file.name}-${index}`}
                    file={file}
                  />
                ))}
              </div>
            )}
          </InputField>
        </div>

        <Footer
          onClose={onClose}
          submitText={event ? "Сохранить изменения" : "Добавить запись"}
        />
      </form>
    </Modal>
  );
}

const emptyFuel = {
  date: today(),
  odometer: "",
  fuelValue: "",
  pricePerLiter: ""
};

export const FuelModal = ({ open, fuel, onClose, onSave }) => {
  const [fuelFields, setFuelFields] = useState(fuel || emptyFuel);

  useEffect(() => {
    if (open) {
      setFuelFields(fuel || emptyFuel);
    }
  }, [open, fuel]);

  const updateField = (key, value) => {
    setFuelFields((previous) => ({ ...previous, [key]: value }));
  };

  const total =
    (Number(fuelFields.fuelValue) || 0) * (Number(fuelFields.pricePerLiter) || 0);

  const save = (event) => {
    event.preventDefault();

    onSave({
      ...fuelFields,
      id: fuelFields.id || makeId("fuel"),
      odometer: Number(fuelFields.odometer),
      fuelValue: Number(fuelFields.fuelValue),
      pricePerLiter: Number(fuelFields.pricePerLiter)
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fuel ? "Изменить заправку" : "Новая заправка"}
    >
      <form onSubmit={save}>
        <div className="form-row cols-2">
          <InputField label="Дата">
            <input
              type="date"
              value={fuelFields.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Пробег, км">
            <input
              type="number"
              min="0"
              value={fuelFields.odometer}
              onChange={(event) => updateField("odometer", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Топливо, л">
            <input
              type="number"
              min="0"
              step="0.01"
              value={fuelFields.fuelValue}
              onChange={(event) => updateField("fuelValue", event.target.value)}
              required
            />
          </InputField>

          <InputField label="Цена за литр, ₽">
            <input
              type="number"
              min="0"
              step="0.01"
              value={fuelFields.pricePerLiter}
              onChange={(event) => updateField("pricePerLiter", event.target.value)}
              required
            />
          </InputField>
        </div>

        <div className="preview-total">
          <span>Итого</span>
          <strong>
            {total.toLocaleString("ru-RU", {
              minimumFractionDigits: 2
            })} ₽
          </strong>
        </div>

        <Footer onClose={onClose} submitText={fuel ? "Сохранить изменения" : "Добавить заправку"}/>
      </form>
    </Modal>
  );
};

const emptyTask = {
  title: "",
  date: "",
  odometer: "",
  completed: false
};

export function TaskModal({ open, task, onClose, onSave }) {
  const [taskFields, setTaskFields] = useState(task || emptyTask);

  useEffect(() => {
    if (open) {
    setTaskFields(task || emptyTask);
    }
  }, [open, task]);

  const updateField = (key, value) => {
  setTaskFields((previous) => ({ ...previous, [key]: value }));
  };

  const save = (event) => {
    event.preventDefault();

    onSave({
      ...taskFields,

      id: taskFields.id || makeId("task"),

      odometer: taskFields.odometer ? Number(taskFields.odometer) : null
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}

      title={task ? "Изменить задачу" : "Новая задача"}
    >
      <form onSubmit={save}>
        <div className="form-row">
          <InputField label="Название">
            <input
              value={taskFields.title}

              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Например, Замена масла"
              required
            />
          </InputField>

          <InputField label="Дата (необязательно)">
            <input
              type="date"

              value={taskFields.date || ""}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </InputField>


          

          <InputField label="Плановый пробег (необязательно)">
            <input
              type="number"
              min="0"

              value={taskFields.odometer ?? ""}
              onChange={(event) => updateField("odometer", event.target.value)}
            />
          </InputField>
        </div>

        <Footer
          onClose={onClose}

          submitText={task ? "Сохранить изменения" : "Добавить задачу"}
        />
      </form>
    </Modal>
);}

const InputField = inputField;

export { InputField };