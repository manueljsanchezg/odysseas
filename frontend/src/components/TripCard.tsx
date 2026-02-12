import { useNavigate } from '@solidjs/router'
import { Component } from 'solid-js'
import { getDaysBetweenDates } from '../utils/daysBetweenDates'
import { getStatusColor } from '../utils/statusColor'

interface City {
  id: number
  name: string
  countryIso: string
}

interface TripCity {
  city: City
}

export interface Trip {
  id: number
  title: string
  description?: string
  status: string
  startDate: string
  endDate: string
  userId: number
  cities: TripCity[]
}

const TCard: Component<Trip> = (props) => {
  const navigate = useNavigate()

  return (
    <div class="card w-full max-w-lg bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <figure class="h-64 overflow-hidden relative">
        <img
          class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          src="https://media.istockphoto.com/id/1497396873/es/foto/listo-para-comenzar-mis-vacaciones-en-la-playa.jpg?s=612x612&w=0&k=20&c=26T_8jyLnZA2XOOMYgMhMTZJzXLjHa1ZsR9YiCivnDg="
          alt={props.title}
        />

        <div class="absolute top-4 right-4 badge badge-accent badge-lg shadow-md font-bold">
           {getDaysBetweenDates(props.startDate, props.endDate)} Days
        </div>
      </figure>

      <div class="card-body">
        <div class="flex justify-between items-start">
          <h2 class="card-title text-2xl font-bold">{props.title}</h2>

          <div class={`badge badge-outline font-bold p-3 ${getStatusColor(props.status)}`}>
            {props.status}
          </div>
        </div>

        <p class="text-base-content/70">Departure: <span class="font-semibold">{props.startDate}</span></p>

        <div class="divider my-1"></div> 

        <div class="card-actions justify-end">
          <button
            onClick={() => navigate(`/trips/${props.id}`)}
            class="btn btn-primary w-full text-lg"
          >
            Go to Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default TCard