import { A, useParams } from '@solidjs/router'
import { Component, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'

import { findTripByIdAndUserId } from '../../api/trip.service'
import { Trip } from '../../components/TripCard'
import { getDaysBetweenDates } from '../../utils/daysBetweenDates'
import { getStatusColor } from '../../utils/statusColor'
import AddCitiesModal from '../../components/AddCitiesModal'

const TripDetail: Component = () => {
  const params = useParams()
  const [trip, setTrip] = createSignal<Trip>()
  const [isLoading, setIsLoading] = createSignal(true)
  const [errorType, setErrorType] = createSignal<'NOT_FOUND' | 'SERVER' | null>(null)

  const [isOpen, setIsOpen] = createSignal(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const fetchTrip = async () => {
    try {
      setIsLoading(true)
      const result = await findTripByIdAndUserId(Number(params.id))
      if (result.success) {
        setTrip(result.trip)
      } else {
        setErrorType(result.errorType as 'NOT_FOUND' | 'SERVER')
      }
    } catch {
      setErrorType('SERVER')
    } finally {
      setIsLoading(false)
    }
  }

  onMount(fetchTrip)

  const ErrorView = () => (
    <div class="hero min-h-[50vh] bg-base-200 rounded-3xl">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="text-9xl mb-4">{errorType() === 'NOT_FOUND' ? '🗺️' : '⚠️'}</div>
          <h1 class="text-3xl font-bold">
            {errorType() === 'NOT_FOUND' ? 'Adventure Not Found' : 'Something went wrong'}
          </h1>
          <p class="py-6">
            {errorType() === 'NOT_FOUND'
              ? "We couldn't find the trip you're looking for. It might have been deleted or you don't have permission to view it."
              : 'There was a problem loading the trip details. Please try again later.'}
          </p>
          <A href="/trips" class="btn btn-primary">
            Back to Adventures
          </A>
        </div>
      </div>
    </div>
  )

  return (
    <div class="flex flex-col w-full items-center py-10 px-4 bg-base-200 min-h-screen">

      <Show when={!errorType()}>
        <div class="w-full max-w-4xl mb-6">
          <A href="/trips" class="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Adventures
          </A>
        </div>
      </Show>

      <Switch>
        <Match when={isLoading()}>
          <div class="flex h-[50vh] w-full items-center justify-center">
            <div class="flex flex-col items-center gap-4">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <span class="text-base-content/70 font-medium animate-pulse">Loading adventure details...</span>
            </div>
          </div>
        </Match>

        <Match when={errorType()}>
          <ErrorView />
        </Match>

        <Match when={trip()}>
          {(t) => (
            <div class="card w-full max-w-4xl bg-base-100 shadow-xl overflow-hidden animate-fade-in-up">

              <figure class="relative h-96 w-full">
                <img
                  class="w-full h-full object-cover"
                  src="https://media.istockphoto.com/id/1497396873/es/foto/listo-para-comenzar-mis-vacaciones-en-la-playa.jpg?s=612x612&w=0&k=20&c=26T_8jyLnZA2XOOMYgMhMTZJzXLjHa1ZsR9YiCivnDg="
                  alt={t().title}
                />
                <div class="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
              </figure>

              <div class="card-body gap-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h1 class="card-title text-4xl font-extrabold">{t().title}</h1>

                  <div class="flex gap-2">
                    <div class="badge badge-lg badge-ghost font-bold p-4">
                      {getDaysBetweenDates(t().startDate, t().endDate)} Days
                    </div>
                    <div class={`badge badge-lg badge-outline font-bold p-4 uppercase ${getStatusColor(t().status)}`}>
                      {t().status}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-base-content/60 font-medium text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t().startDate}</span>
                  <span>➜</span>
                  <span>{t().endDate}</span>
                </div>

                <div class="divider"></div>

                <div class="text-lg leading-relaxed text-base-content/80">
                  <Show when={t().description} fallback={<span class="italic opacity-50">No description added for this adventure yet. Time to plan!</span>}>
                    {t().description}
                  </Show>
                </div>

                <Show when={t().cities && t().cities.length > 0}>
                  <div class="mt-2">
                    <h3 class="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Destinations</h3>
                    <div class="flex flex-wrap gap-2">
                      <For each={t().cities}>
                        {(item) => (
                          <div class="badge badge-lg gap-2 p-4 border-none bg-base-300">
                            <span class="font-bold">{item.city.name}</span>
                            <span class="opacity-80 text-xs font-bold">
                                {item.city.countryIso}
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                <div class="divider"></div>

                <Show when={isOpen()}>
                  <AddCitiesModal tripId={Number(params.id)} onClose={() => setIsOpen(false)} onSuccess={fetchTrip} />
                </Show>

                <div class="card-actions justify-between mt-2">
                  <button
                    onClick={openModal}
                    class="btn btn-primary btn-lg md:w-full sm:min-w-3/6 shadow-lg"
                  >
                    Destinations
                  </button>
                  <button

                    class="btn btn-primary btn-lg md:w-full sm:min-w-3/6 shadow-lg"
                  >
                    Activities
                  </button>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  )
}

export default TripDetail