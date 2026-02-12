import { A, useNavigate } from '@solidjs/router'
import { Component, Show } from 'solid-js'

import { logout } from '../api/auth.service'
import { authStore } from '../store/authStore'

const NavBar: Component = () => {
  const navigate = useNavigate()

  const closeMenu = () => {
    const elem = document.activeElement;
    if (elem instanceof HTMLElement) {
      elem.blur()
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavLinks = () => (
    <>
      <li>
        <A href="/" onClick={closeMenu} activeClass="active" >Home</A>
      </li>
      
      <Show when={authStore.role === 'USER'}>
        <li><A href="/trips" onClick={closeMenu} activeClass="active">Trips</A></li>
        <li><button  onClick={() => {
          handleLogout()
          closeMenu()
        }}>Logout</button></li>
      </Show>

      <Show when={!authStore.role}>
        <li><A href="/login" onClick={closeMenu} activeClass="active">Login</A></li>
        <li><A href="/register" onClick={closeMenu} activeClass="active">Register</A></li>
      </Show>
    </>
  )

  return (
    <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50 px-4">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabIndex={0} role="button" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <NavLinks />
          </ul>
        </div>
        
        <A href="/" class="btn btn-ghost text-xl font-bold text-primary">
          Odysseas
        </A>
      </div>

      <div class="navbar-end hidden lg:flex">
        <ul class="menu menu-horizontal px-1 text-base font-medium">
          <NavLinks />
        </ul>
      </div>
      
    </div>
  )
}

export default NavBar