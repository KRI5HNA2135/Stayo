import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  async function registerUser(ev) {
    ev.preventDefault();
    try {
      await axios.post('/register', {
        name, email, password
      });
      alert('Registeration Successfull')
    } catch (error) {
      alert('Registeration failed')
    }
  }


   return (
      <div className="mt-4 grow flex items-center justify-around ">
        <div className="mb-64 ">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" 
              onSubmit={registerUser}>
         <input type="text" 
                placeholder="Name..."
                value={name}
                onChange={ev => setName(ev.target.value)}
         />
          <input type="email"
                 placeholder="your@email.com"
                 value={email}
                 onChange={ev => setEmail(ev.target.value)}
                 
                  />
          <input type="password"
                 placeholder="password..."
                 value={password}
                 onChange={ev => setPassword(ev.target.value)}
                 
                 />
          <button className="primary">Register</button>
          <div className="text-gray-500 text-center py-2">
            Allready a member? <Link to ={'/login'} className="underline text-black " >Login </Link>
          </div>
          
        </form>
        </div>
      </div>
   )
}