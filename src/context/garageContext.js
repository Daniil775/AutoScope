"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "autoscope-data";//ключ
const garageContext = createContext(null);

function blankGarage() {

  return {
    userCar: null,
    events: [],
    fuel: [],
    tasks: []
  };}

function loadGarage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankGarage();

    const saved = JSON.parse(raw);

    return {
      userCar: saved.userCar ?? null,
      events: Array.isArray(saved.events) ? saved.events : [],
      fuel: Array.isArray(saved.fuel) ? saved.fuel : [],
      tasks: Array.isArray(saved.tasks) ? saved.tasks : []
    };
  } catch (error) {
    console.error("Не удалось прочитать данные автомобиля  ", error);
    return blankGarage();
  }
}

const changeItem = (items, nextItem) =>
  items.map((item) => (item.id === nextItem.id ? nextItem : item));

const removeItem = (items, id) => items.filter((item) => item.id !== id);

//keisi

function garageReducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, ready: true };

    case "reset":
      return { ...blankGarage(), ready: true };

    case "set-userCar":
    return { ...state, userCar: action.payload };

    case "add-event":
      return { ...state, events: [action.payload, ...state.events] };
    case "update-event":
      return { ...state, events: changeItem(state.events, action.payload) };
    case "delete-event":
      return { ...state, events: removeItem(state.events, action.payload) };

    case "add-fuel":
      return { ...state, fuel: [action.payload, ...state.fuel] };
    case "update-fuel":
      return { ...state, fuel: changeItem(state.fuel, action.payload) };
    case "delete-fuel":
      return { ...state, fuel: removeItem(state.fuel, action.payload) };

    case "add-task":
    return { ...state, tasks: [action.payload, ...state.tasks] };
    case "update-task":
      return { ...state, tasks: changeItem(state.tasks, action.payload) };
    case "toggle-task":
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === action.payload ? { ...task, completed: !task.completed } : task )
      };
    case "delete-task":
      return { ...state, tasks: removeItem(state.tasks, action.payload) };

    default:
      return state;
}}

export function GarageProvider({ children }) {
  const [GarageStorage, dispatch] = useReducer(garageReducer, null, () => ({
    ...blankGarage(),
    ready: false
  }));



  useEffect(() => {
    dispatch({ type: "hydrate", payload: loadGarage() });
  }, []);
  useEffect(() => {
    if (!GarageStorage.ready) return;
    try {
      const { ready, ...persisted } = GarageStorage;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (error) {
      console.error("Не удалось сохранить данные автомобиля", error);
    }}, [GarageStorage]);

  const stats = useMemo(() => {
    const serviceTotal = GarageStorage.events.reduce(
      (total, item) => total + Number(item.cost || 0),
      0);

    const fuelTotal = GarageStorage.fuel.reduce(
      (total, item) =>
        total + Number(item.fuelValue || 0) * Number(item.pricePerLiter || 0),
      0);

    const litersTotal = GarageStorage.fuel.reduce(
      (total, item) => total + Number(item.fuelValue || 0),
      0);

    const operational = serviceTotal + fuelTotal;
    const ownership = Number(GarageStorage.userCar?.purchasePrice || 0) + operational;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const year = String(now.getFullYear());

    const eventCost = (items) =>
        items.reduce((total, item) => total + Number(item.cost || 0), 0);
    const fuelCostFor = (items) =>
        items.reduce(
          (total, item) =>
            total + Number(item.fuelValue || 0) * Number(item.pricePerLiter || 0),
          0);

    const monthSpend = eventCost(GarageStorage.events.filter((item) => item.date?.startsWith(month))) +  fuelCostFor(GarageStorage.fuel.filter((item) => item.date?.startsWith(month)));
    const yearSpend = eventCost(GarageStorage.events.filter((item) => item.date?.startsWith(year))) + fuelCostFor(GarageStorage.fuel.filter((item) => item.date?.startsWith(year)));
    const fuelEntries = [...GarageStorage.fuel].sort(
      (a, b) => Number(a.odometer) - Number(b.odometer));

    const consumptions = [];

    for (let i = 1; i < fuelEntries.length; i += 1) {
      const distance = Number(fuelEntries[i].odometer) - Number(fuelEntries[i - 1].odometer);
      const fuelValue = Number(fuelEntries[i].fuelValue);


      if (distance > 0 && fuelValue > 0) {
        consumptions.push((fuelValue / distance) * 100);
      }
    }

    const avgConsumption = consumptions.length ? consumptions.reduce((sum, value) => sum + value, 0) / consumptions.length : null;

    const months = new Set(
      [...GarageStorage.events, ...GarageStorage.fuel]
      .map((item) => item.date?.slice(0, 7))
      .filter(Boolean)
    );

    return {
      service: serviceTotal,
      fuelCost: fuelTotal,
      operational,
      ownership,
      monthSpend,
      yearSpend,
      totalLiters: litersTotal,
      avgFuelPrice: litersTotal ? fuelTotal / litersTotal : null,
      avgConsumption,
      avgMonthly: months.size ? operational / months.size : 0
    };
  }, [GarageStorage.events, GarageStorage.fuel, GarageStorage.userCar]);

  const value = useMemo(() => {
    const { ready, ...publicGarage } = GarageStorage;


    return {
      ...publicGarage,
      ...stats,
      hydrated: ready,
      addEvent: (event) => dispatch({ type: "add-event", payload: event }),
      updateEvent: (event) => dispatch({ type: "update-event", payload: event }),
      deleteEvent: (id) => dispatch({ type: "delete-event", payload: id }),
      addFuel: (entry) => dispatch({ type: "add-fuel", payload: entry }),
      updateFuel: (entry) => dispatch({ type: "update-fuel", payload: entry }),
      deleteFuel: (id) => dispatch({ type: "delete-fuel", payload: id }),
      addTask: (task) => dispatch({ type: "add-task", payload: task }),
      updateTask: (task) => dispatch({ type: "update-task", payload: task }),
      toggleTask: (id) => dispatch({ type: "toggle-task", payload: id }),
      deleteTask: (id) => dispatch({ type: "delete-task", payload: id }),
      updateCar: (userCar) => dispatch({ type: "set-userCar", payload: userCar }),
      resetData: () => dispatch({ type: "reset" })
    };
  }, [GarageStorage, stats]);

  
  return <garageContext.Provider value={value}>{children}</garageContext.Provider>;
}

export function useGarage() {
  const garage = useContext(garageContext);

  if (!garage) {
    throw new Error("useGarage должен использоватся внутри GarageProvider");
  }

  return garage;
}
