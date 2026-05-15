import Button from "./Button"

/*hook para gerenciamento de estado (states)*/
import { useState } from "react" 

function LoginForm({ entrar }) {

   /*States para armazenar os valores dos inputs*/
  const [email, setEmail] = useState("") 
  const [senha, setSenha] = useState("") 

  return (
    <form onSubmit={entrar}>

      {/*Input controlado de email*/} 
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          title="Digite um e-mail válido"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
    />

         
        {/*Input controlado de senha*/} 
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          required
          minLength="8"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
            
        <p>
            <a href="#" className="link">Esqueci minha senha</a>
        </p>
                    
        {/*aqui o componente de botão reutilizável*/}
        <Button
          texto="Entrar"
          type="submit"
        />

        
        <p>
            Não possui uma conta?
            <a href="#" className="link">Cadastre-se</a>
        </p>
    </form>
  )
}

export default LoginForm