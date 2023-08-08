import React,{useEffect} from 'react';
import { NavLink,useLocation } from 'react-router-dom'

export default function Header() {

  const location =useLocation()
  useEffect(() => {
   
    
   }, [location])
  
  let user=localStorage.getItem('token')

function logout(){
  localStorage.setItem('token',"")
}
  return <div className='navbar'>
      <nav className='navs'>
          <h1 className='logo'>LAUNDRY</h1>
          <ul className='nav-list'>

          <NavLink className={`li ${location.pathname==="/"? "active":""}`} to={"/"} >Home</NavLink>
          <NavLink className={`li ${location.pathname==="/"? "active":""}`} to={"/"} >Pricing</NavLink>
        <NavLink  className={`li ${location.pathname==="/"? "active":""}`} to={"/"}  >Career</NavLink>
        {!user?
        <NavLink  className='btn li' to={"/"}>Sign In</NavLink>:
        <NavLink  className='btn li' to={"/"} onClick={logout}>Logout</NavLink>}
          </ul>
      </nav>
  </div>;
}
