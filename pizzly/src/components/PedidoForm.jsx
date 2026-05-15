import Button from "./Button"

function PedidoForm() {
  return (
    <form>

      <label>Nome:</label>
      <input
        type="text"
        id="nome"
        name="nome"
        required
      />

      <br /><br />

      <label>Sabor:</label>

      <select
        name="pizza"
        className="select-menor"
        required
      >
        <option disabled defaultValue>
          Selecione o sabor
        </option>

        <option>Calabresa</option>
        <option>Frango com Catupiry</option>
        <option>Quatro Queijos</option>
        <option>Portuguesa</option>
      </select>

      <br /><br />

      <label>Tamanho:</label>

      <select
        name="tamanho"
        className="select-menor"
        required
      >
        <option disabled defaultValue>
          Selecione o tamanho
        </option>

        <option>P</option>
        <option>M</option>
        <option>G</option>
      </select>

      <br /><br />

      <label>Observações:</label>

      <br />

      <textarea
        name="obs"
        placeholder="Ex: sem cebola, borda recheada..."
        rows="4"
      ></textarea>

      <br /><br />

      <Button
        texto="Fazer Pedido"
        type="submit"
      />

    </form>
  )
}

export default PedidoForm
