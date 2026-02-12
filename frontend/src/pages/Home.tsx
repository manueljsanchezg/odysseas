import { A } from '@solidjs/router'
import { Component, Show } from 'solid-js'

import { authStore } from '../store/authStore'

const Home: Component = () => {
  return (
    <div class="min-h-screen w-full bg-base-200 flex flex-col items-center py-10 px-4">
      
      <div class="card lg:card-side w-full max-w-5xl bg-base-100 shadow-xl overflow-hidden mb-12">
        
        <div class="card-body md:w-1/2 justify-center gap-6 p-10">
          <div>
            <span class="badge badge-primary badge-outline font-bold p-3">
              Travel App
            </span>
            
            <h1 class="text-5xl font-extrabold text-base-content mt-4 leading-tight">
              Welcome to <span class="text-primary">Odysseas</span>
            </h1>
            
            <p class="text-base-content/70 mt-4 text-xl">
              Plan, track, and enjoy your next adventure without the stress. Everything you need for
              your trips in one place.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 mt-2">
            <Show when={authStore.token}>
              <A
                href="/trips"
                class="btn btn-primary btn-lg shadow-lg"
              >
                Get Started
              </A>
              <A
                href="/trips"
                class="btn btn-outline btn-lg"
              >
                Explore your trips
              </A>
            </Show>

            <Show when={!authStore.token}>
              <A
                href="/login"
                class="btn btn-primary btn-lg shadow-lg"
              >
                Get Started
              </A>
              <A
                href="/login"
                class="btn btn-outline btn-lg"
              >
                Explore your trips
              </A>
            </Show>
          </div>
        </div>

        <figure class="md:w-1/2 h-64 md:h-auto relative">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
            alt="Travel Adventure"
            class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </figure>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div class="card-body">
            <h3 class="card-title text-2xl font-bold text-base-content">Plan Ahead</h3>
            <p class="text-base-content/70 text-lg">
              Create itineraries easily. Set your start and end dates and never miss a flight.
            </p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div class="card-body">
            <h3 class="card-title text-2xl font-bold text-base-content">Track Days</h3>
            <p class="text-base-content/70 text-lg">
              Visualize duration instantly. We calculate the days between dates automatically.
            </p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div class="card-body">
            <h3 class="card-title text-2xl font-bold text-base-content">Stay Organized</h3>
            <p class="text-base-content/70 text-lg">
              Keep descriptions, statuses, and details of all your adventures in one dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home