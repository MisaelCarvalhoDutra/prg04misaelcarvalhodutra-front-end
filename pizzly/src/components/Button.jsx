function Button({
  texto,
  classe = "",
  type = "button",
  onClick
}) {
  return (
    <button
      type={type}
      className={classe}
      onClick={onClick}
    >
      {texto}
    </button>
  )
}

export default Button

