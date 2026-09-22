"use client";

const Modal = (props) => {
  const { children, onClose } = props;


  if (!props.open) {
    return null;
  }

  return (
    <div className="popup-bg" onMouseDown={onClose}>
      <div
        className={`popup ${props.wide ? "popup-wide" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="popup-head">
          <h2>{props.title}</h2>
          <button 
            className="icon-btn" 
            onClick={onClose} 
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
