import { ParentComponent } from 'solid-js'
import NavBar from '../components/NavBar'

const MainLayout: ParentComponent = (props) => {
  return (
    <div class="flex flex-col min-h-screen w-full bg-base-200 text-base-content">
      <NavBar />
      <main class="flex-grow w-full">
        {props.children}
      </main>
    </div>
  )
}

export default MainLayout