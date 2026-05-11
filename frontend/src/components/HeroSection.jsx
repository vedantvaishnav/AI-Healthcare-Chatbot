import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import illustration from '../assets/healthcare-illustration.svg'

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-cyan-100/80 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="relative z-10">
          <div className="inline-flex rounded-full bg-cyan-100/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm ring-1 ring-cyan-200/70">
            AI Healthcare dashboard built for you
          </div>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Your Personal HealthAI Assistant
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Discover intelligent recommendations, meal planning, and wellness tracking with a clean, responsive healthcare experience.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-cyan-700"
            >
              Get Started
            </Link>
            <Link
              to="#features"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:border-cyan-200 hover:bg-cyan-50"
            >
              Learn More
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass ring-1 ring-white/80">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Trusted care</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">24/7</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass ring-1 ring-white/80">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Healthy meals</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">99+</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-100/90 to-slate-100 p-6 shadow-glass ring-1 ring-white/80 sm:p-8">
            <img src={illustration} alt="Healthcare AI illustration" className="w-full rounded-[1.75rem]" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
