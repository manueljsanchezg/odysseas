import { Component, createMemo, createSignal, For, onMount, Show } from 'solid-js'

import { findTripsByUserId } from '../../api/trip.service'
import TCard, { Trip } from '../../components/TripCard'
import TripCreateModal, { TripStatus } from '../../components/TripCreateModal'

const Trips: Component = () => {
  const [tripList, setTripList] = createSignal<Trip[]>([])
  const [tripStatus, setTripStatus] = createSignal<TripStatus>()
  const [searchedTitle, setSearchedTitle] = createSignal('')
  const [isLoading, setIsLoadig] = createSignal(true)
  const [show, setShow] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const displayTrips = createMemo(() => {
    const title = searchedTitle().toLowerCase()
    const status = tripStatus()
    return tripList().filter((trip) => {
      const matchedTitle = !title || trip.title.toLowerCase().startsWith(title)
      const matchesStatus = !status || trip.status === status
      return matchedTitle && matchesStatus
    })
  })

  onMount(async () => {
    try {
      const result = await findTripsByUserId()
      if (result.success) {
        setTripList(result.trips)
      } else {
        setError('We were unable to load your adventures. Please try again later')
      }
    } catch {
      setError('Unexpected error')
    } finally {
      setIsLoadig(false)
    }
  })

  return (
    <div class="flex flex-col w-full items-center py-10 px-4 min-h-screen">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold text-base-content">Explore your adventures</h1>
        <p class="text-base-content/60 mt-2">Manage all your trips in one place</p>
      </div>

      <div class="w-full max-w-2xl flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">

        <div class="form-control w-full md:w-auto flex-grow">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchedTitle()}
              onInput={(e) => setSearchedTitle(e.target.value)}
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <details class='dropdown'>
            <summary>Filter by status</summary>
            <ul class="menu menu-sm dropdown-content">
              <For each={['WISHLIST', 'PLANNED', 'ORGANIZED', 'COMPLETED']}>
                {(status) => (
                  <button
                    onClick={(e) => {
                      setTripStatus(status === tripStatus() ? undefined : (status as TripStatus))
                      e.currentTarget.closest("details")?.removeAttribute("open")
                    }}
                    class={`btn ${status === tripStatus() ? 'btn-active btn-neutral' : 'bg-base-100'}`}
                  >
                    {status}
                  </button>
                )}
              </For>
            </ul>
          </details>

        </div>

      </div>

      <div class="join mb-10 shadow-sm overflow-x-auto max-w-full">
        <button
          onClick={() => setShow(true)}
          class="btn btn-primary shadow-lg whitespace-nowrap"
        >
          + Create Trip
        </button>
      </div>

      <Show when={error()}>
        <div role="alert" class="alert alert-error max-w-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error()}</span>
        </div>
      </Show>

      <Show when={show()}>
        <TripCreateModal onClose={() => setShow(false)} />
      </Show>

      <Show when={!isLoading()} fallback={<div class="loading loading-spinner loading-lg text-primary"></div>}>
        <div class="flex flex-col gap-8 w-full items-center">

          <Show when={tripList().length === 0 && !error()}>
            <div class="hero bg-base-200 rounded-2xl p-10 max-w-lg">
              <div class="hero-content text-center">
                <div class="max-w-md">
                  <h1 class="text-2xl font-bold">No trips yet</h1>
                  <p class="py-6">Start your journey by creating your first trip plan.</p>
                  <button onClick={() => setShow(true)} class="btn btn-primary">Create Trip</button>
                </div>
              </div>
            </div>
          </Show>

          <Show when={displayTrips()}>
            <For each={displayTrips()}>{(trip) => <TCard {...trip} />}</For>
          </Show>

          <Show when={tripList().length > 0 && displayTrips().length === 0}>
            <p class="text-base-content/50">No trips matched with status <span class='font-bold'>{tripStatus()?.toLowerCase()}</span></p>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default Trips