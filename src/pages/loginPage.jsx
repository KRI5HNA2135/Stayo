import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [redirect, setRedirect] = useState(false);
const {setUser} = useContext(UserContext);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    try {
      
      const {data} = await axios.post('/login', {email , password});
      setUser(data);
      alert('Login Successful')
      setRedirect(true);
    } catch (error) {
      console.error(`login Error: ${error}`)
      alert('login Failed')
    }
  }

  if(redirect) {
    return <Navigate to={'/'} />
  }

   return (
      <div className="mt-4 grow flex items-center justify-around ">
        <div className="mb-64 ">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input type="email"
                 placeholder="your@email.com"
                 value={email}
                 onChange={e => {setEmail(e.target.value)}}
                  />
          <input type="password"
                 placeholder="password..."
                 value={password}
                 onChange={e => {setPassword(e.target.value)}}
                 />
          <button className="primary">Login</button>
          <div className="text-gray-500 text-center py-2">
            Don't have an account yet? <Link to ={'/register'} className="underline text-black " >Register Now </Link>
          </div>
          
        </form>
        </div>
      </div>
   )
}