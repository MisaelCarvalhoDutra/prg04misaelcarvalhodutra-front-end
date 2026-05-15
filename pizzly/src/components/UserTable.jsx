import Button from "./Button"

function UserTable() {
  return (
    <table className="tabela">

      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td>1</td>
          <td>Maria</td>
          <td>maria@email.com</td>
          <td>
            <Button
              texto="Editar"
              classe="btn-editar"
            />

            <Button
              texto="Excluir"
              classe="btn-excluir"
            />
          </td>
        </tr>

        <tr>
          <td>2</td>
          <td>Gustavo</td>
          <td>gustavo@email.com</td>
          <td>
            <Button
              texto="Editar"
              classe="btn-editar"
            />

            <Button
              texto="Excluir"
              classe="btn-excluir"
            />
          </td>
        </tr>

        <tr>
          <td>3</td>
          <td>José</td>
          <td>jose@email.com</td>
          <td>
            <Button
              texto="Editar"
              classe="btn-editar"
            />

            <Button
              texto="Excluir"
              classe="btn-excluir"
            />
          </td>
        </tr>

        <tr>
          <td>4</td>
          <td>Guilherme</td>
          <td>guilherme@email.com</td>
          <td>
            <Button
              texto="Editar"
              classe="btn-editar"
            />

            <Button
              texto="Excluir"
              classe="btn-excluir"
            />
          </td>
        </tr>

        <tr>
          <td>5</td>
          <td>Jonatas</td>
          <td>jonatas@email.com</td>
          <td>
            <Button
              texto="Editar"
              classe="btn-editar"
            />

            <Button
              texto="Excluir"
              classe="btn-excluir"
            />
          </td>
        </tr>

      </tbody>

    </table>
  )
}

export default UserTable

