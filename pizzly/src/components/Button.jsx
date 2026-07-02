// componente reutilizável de botão
// permite alterar texto, classe CSS, tipo e ação executada ao clicar

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

