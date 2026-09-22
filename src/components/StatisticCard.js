const StatisticCard = (props) => {
  const accentClass = props.accent ? "accent" : "";

  return (
    <div className={`stat ${accentClass}`}>

      <span className="stat-caption">{props.label}</span>
      <strong>{props.value}</strong>
      {props.hint && <small>{props.hint}</small>}

    </div>
  );
};

export default StatisticCard;